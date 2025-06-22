/* @refresh skip */
import React, { createContext, useState, useContext, useCallback } from 'react';
import MusicTempo from 'music-tempo';
import { useSequencerSettings } from './SequencerSettingsContext';
import { audioContext } from './PlaybackContext'; // Import the instance, NOT the hook
import { downloadFile } from '../utils/fileUtils';
import { playSound } from '../utils/audioManager';
import { playAudioSlice as playAudioSliceUtil } from '../utils/audioUtils';

const SequenceContext = createContext(null);

// Helper functions defined outside the component
const createEmptyPose = () => ({
    jointInfo: {},
    grounding: { L: null, R: null, L_weight: 50, R_weight: 50, },
});

const createEmptyBar = () => Array(16).fill(null).map(() => ({
    pose: createEmptyPose(),
    sounds: [],
    waveform: null,
}));

const createInitialData = (bars = 4) => {
    const data = { 
        audioBuffer: null, 
        audioFileName: null, 
        bars: {}, 
        gridOffset: 0
    };
    for (let i = 0; i < bars; i++) {
        data.bars[i] = createEmptyBar();
    }
    return data;
};

// The Provider Component
export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [history, setHistory] = useState([createInitialData()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const { bpm, setBpm } = useSequencerSettings();

    // --- FIX: The usePlayback() hook is permanently removed from this file. ---

    const updateSongData = useCallback((newData, addToHistory = true) => {
        setSongData(currentData => {
            const nextData = typeof newData === 'function' ? newData(currentData) : newData;
            if (addToHistory) {
                const newHistory = [...history.slice(0, historyIndex + 1), nextData];
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
            return nextData;
        });
    }, [history, historyIndex]);

    const generateAndStoreWaveforms = useCallback((buffer, currentBpm) => {
        if (!buffer || currentBpm <= 0) return;
        const beatsInTrack = buffer.duration * (currentBpm / 60);
        const totalBars = Math.ceil(beatsInTrack / 16);
        const newBars = {};
        for (let i = 0; i < totalBars; i++) {
            newBars[i] = createEmptyBar();
        }
        
        const channelData = buffer.getChannelData(0);
        const totalSamples = channelData.length;
        const samplesPerBeat = totalSamples / beatsInTrack;
        
        for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 16; beat++) {
                const beatIndexGlobal = (bar * 16) + beat;
                const startSample = Math.floor(beatIndexGlobal * samplesPerBeat);
                const endSample = Math.floor(startSample + samplesPerBeat);
                if (startSample >= totalSamples) continue;
                
                const segment = channelData.slice(startSample, endSample);
                const waveformPoints = [];
                const step = Math.max(1, Math.floor(segment.length / 100));
                for (let i = 0; i < segment.length; i += step) {
                    let maxVal = 0;
                    const chunk = segment.slice(i, i + step);
                    for(let j = 0; j < chunk.length; j++) {
                        if (Math.abs(chunk[j]) > maxVal) maxVal = Math.abs(chunk[j]);
                    }
                    waveformPoints.push(maxVal);
                }
                newBars[bar][beat].waveform = waveformPoints;
            }
        }
        updateSongData(prev => ({ ...prev, bars: newBars }), false);
    }, [updateSongData]);

    const loadAudioFile = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            if (audioContext.state === 'suspended') await audioContext.resume();
            const arrayBuffer = await file.arrayBuffer();
            const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer);
            const musicTempo = new MusicTempo(decodedAudioData.getChannelData(0));
            const detectedBpm = Math.round(musicTempo.tempo);
            setBpm(detectedBpm);
            generateAndStoreWaveforms(decodedAudioData, detectedBpm);
            updateSongData(prev => ({ ...prev, audioBuffer: decodedAudioData, audioFileName: file.name, gridOffset: 0 }), true);
        } catch (error) { console.error("Error processing audio file:", error); }
    }, [setBpm, generateAndStoreWaveforms, updateSongData]);

    // --- FIX: RESTORED THIS FUNCTION ---
    const setGridStartTime = useCallback((newOffset) => {
        if (songData.audioBuffer) {
            updateSongData(prev => ({ ...prev, gridOffset: newOffset }), true);
        }
    }, [songData.audioBuffer, updateSongData]);

    const getBeatData = useCallback((barIndex, beatIndex) => {
        return songData.bars?.[barIndex]?.[beatIndex] || createEmptyBar()[0];
    }, [songData]);

    const triggerBeat = useCallback((bar, beat) => {
        const beatData = getBeatData(bar, beat);
        if (!beatData) return;
        if (beatData.sounds?.length > 0) {
            beatData.sounds.forEach(soundUrl => playSound(soundUrl));
        }
        if (songData.audioBuffer) {
             playAudioSliceUtil(songData.audioBuffer, bpm, songData.gridOffset, bar, beat);
        }
    }, [getBeatData, songData.audioBuffer, bpm, songData.gridOffset]);

    const addSoundToBeat = useCallback((barIndex, beatIndex, soundUrl) => {
        updateSongData(prevData => {
            const newBars = JSON.parse(JSON.stringify(prevData.bars));
            const beat = newBars[barIndex]?.[beatIndex];
            if (beat) {
                if (!beat.sounds) beat.sounds = [];
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundUrl)) {
                    beat.sounds.push(soundUrl);
                }
            }
            return { ...prevData, bars: newBars };
        }, true);
    }, [updateSongData]);

    const removeSoundFromBeat = useCallback((barIndex, beatIndex, soundUrlToRemove) => {
        updateSongData(prevData => {
            const newBars = JSON.parse(JSON.stringify(prevData.bars));
            const beat = newBars[barIndex]?.[beatIndex];
            if (beat?.sounds) {
                beat.sounds = beat.sounds.filter(s => s !== soundUrlToRemove);
            }
            return { ...prevData, bars: newBars };
        }, true);
    }, [updateSongData]);

    const setPoseForBeat = useCallback((barIndex, beatIndex, pose) => {
        updateSongData(prevData => {
            const newBars = { ...prevData.bars };
            if (!newBars[barIndex]) {
                for (let i = Object.keys(newBars).length; i <= barIndex; i++) {
                    newBars[i] = createEmptyBar();
                }
            }
            const barToUpdate = [...newBars[barIndex]];
            if (!barToUpdate[beatIndex]) {
                barToUpdate[beatIndex] = createEmptyBar()[0];
            }
            barToUpdate[beatIndex].pose = pose || null;
            newBars[barIndex] = barToUpdate;
            return { ...prevData, bars: newBars };
        }, false);
    }, [updateSongData]);
    
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setSongData(history[newIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setSongData(history[newIndex]);
        }
    };
    
    const onSave = useCallback(() => {
        if (!songData) {
            console.error("No sequence data to save.");
            return;
        }
        try {
            const dataToSave = { ...songData, audioBuffer: null };
            const dataStr = JSON.stringify(dataToSave, null, 2);
            const fileName = `sequence-${Date.now()}.seqsync.json`;
            downloadFile(dataStr, fileName, "application/json");
        } catch (error) {
            console.error("Failed to save sequence:", error);
        }
    }, [songData]);

    const onLoad = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (loadedData && typeof loadedData.bars === 'object') {
                    updateSongData(prevData => ({ ...prevData, ...loadedData }), true);
                } else { throw new Error("Invalid sequence file format."); }
            } catch (error) {
                console.error("Failed to load sequence file:", error);
            }
        };
        reader.readAsText(file);
    }, [updateSongData]);


    const value = {
        songData,
        getBeatData,
        setPoseForBeat,
        addSoundToBeat,
        removeSoundFromBeat,
        triggerBeat,
        loadAudioFile,
        setGridStartTime,
        onSave,
        onLoad,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
    };

    return (
        <SequenceContext.Provider value={value}>
            {children}
        </SequenceContext.Provider>
    );
};

export const useSequence = () => {
    const context = useContext(SequenceContext);
    if (!context) throw new Error('useSequence must be used within a SequenceProvider');
    return context;
};