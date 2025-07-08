// src/context/SequenceContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { initialSongData } from './initialData'; // Make sure this file uses the nested bar structure
import { produce } from 'immer';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(initialSongData);
    const [history, setHistory] = useState([initialSongData]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // --- MERGED UI STATE ---
    const [currentBar, setCurrentBar] = useState(1);
    const [selectedBeat, setSelectedBeat] = useState(null); // This is the active pad index (0-15) within the current bar
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [activePanel, setActivePanel] = useState('none');
    const [mixerState, setMixerState] = useState({ kitSounds: true, uploadedMedia: false, cameraFeed: true, motionOverlay: true, motionOverlayOpacity: 0.7 });
    const [noteDivision, setNoteDivision] = useState(16);
    const [notification, setNotification] = useState('');

    const totalBars = songData.bars.length;

    const goToNextBar = useCallback(() => setCurrentBar(prev => (prev < totalBars ? prev + 1 : prev)), [totalBars]);
    const goToPrevBar = useCallback(() => setCurrentBar(prev => (prev > 1 ? prev - 1 : prev)), []);
    const showNotification = useCallback((message) => { setNotification(message); setTimeout(() => setNotification(''), 2000); }, []);
    
    const updateSongData = useCallback((newSongData) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newSongData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setSongData(newSongData);
    }, [history, historyIndex]);
    
    const undo = useCallback(() => { if (historyIndex > 0) { const i = historyIndex - 1; setHistoryIndex(i); setSongData(history[i]); } }, [history, historyIndex]);
    const redo = useCallback(() => { if (historyIndex < history.length - 1) { const i = historyIndex + 1; setHistoryIndex(i); setSongData(history[i]); } }, [history, historyIndex]);

    const assignSoundToPad = useCallback((barIndex, beatIndex, soundNote) => {
        const nextState = produce(songData, draft => {
            const beat = draft.bars[barIndex]?.beats[beatIndex];
            if (beat) {
                if (!beat.sounds) beat.sounds = [];
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundNote)) {
                    beat.sounds.push(soundNote);
                }
            }
        });
        updateSongData(nextState);
    }, [songData, updateSongData]);

    const clearSoundsFromPad = useCallback((barIndex, beatIndex) => {
         const nextState = produce(songData, draft => {
            const beat = draft.bars[barIndex]?.beats[beatIndex];
            if (beat) {
                beat.sounds = [];
            }
        });
        updateSongData(nextState);
    }, [songData, updateSongData]);

    const updateBeatWithPose = useCallback((bar, beat, pose) => {
        if (!pose || !pose.jointInfo) return;
        const barIndex = bar - 1;
        const beatIndex = beat - 1;
        const nextState = produce(songData, draft => {
            if (draft.bars[barIndex] && draft.bars[barIndex].beats[beatIndex]) {
                draft.bars[barIndex].beats[beatIndex].pose = pose;
            }
        });
        updateSongData(nextState);
    }, [songData, updateSongData]);

    const handleMediaReady = useCallback(({ duration, detectedBpm }) => {
        const totalBeats = duration * (detectedBpm / 60);
        const totalBars = Math.ceil(totalBeats / 16);
        console.log(`Media ready: ${duration.toFixed(2)}s, ${detectedBpm} BPM, ${totalBars} total bars.`);

        const newBars = Array.from({ length: totalBars > 0 ? totalBars : 1 }, (_, barIndex) => ({
            id: `bar_${barIndex + 1}`,
            beats: Array.from({ length: 16 }, (__, beatIndex) => ({ id: `beat_${barIndex * 16 + beatIndex + 1}`, pose: null, sound: null })),
        }));

        const barStartTimes = newBars.map((_, i) => i * (16 / (detectedBpm / 60)));

        const nextState = produce(initialSongData, draft => {
            draft.bpm = detectedBpm;
            draft.bars = newBars;
            draft.barStartTimes = barStartTimes; // Store start times for seeking
        });

        setHistory([nextState]);
        setHistoryIndex(0);
        setSongData(nextState);
        setCurrentBar(1); // Reset to first bar on new media load
    }, []);

    const value = { 
        songData, setSongData, updateBeatWithPose, assignSoundToPad, clearSoundsFromPad,
        currentBar, totalBars, goToNextBar, goToPrevBar,
        selectedBeat, setSelectedBeat, selectedJoint, setSelectedJoint,
        activePanel, setActivePanel, mixerState, setMixerState,
        noteDivision, setNoteDivision, notification, showNotification,
        undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
        handleMediaReady,
    };
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};