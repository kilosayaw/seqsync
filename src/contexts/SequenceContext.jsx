/* @refresh skip */
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import MusicTempo from 'music-tempo';
import { useSequencerSettings } from './SequencerSettingsContext';
import { audioContext, usePlayback } from './PlaybackContext';
import { downloadFile } from '../utils/fileUtils';
import { playSound } from '../utils/audioManager';
import { playAudioSlice as playAudioSliceUtil } from '../utils/audioUtils';

const SequenceContext = createContext(null);

const createEmptyPose = () => ({
    jointInfo: {},
    grounding: { L: null, R: null, L_weight: 50, R_weight: 50, },
});

const createEmptyBar = () => Array(16).fill(null).map(() => ({
    pose: createEmptyPose(),
    sounds: [],
    audioSlice: null,
    thumbnail: null,
    videoThumbnail: null,
    waveform: null,
}));

const createInitialData = (bars = 4) => {
    const data = { 
        audioBuffer: null, 
        audioFileName: null, 
        bars: {}, 
        gridOffset: 0
    };
    for (let i = 0; i < bars; i++) { data.bars[i] = createEmptyBar(); }
    return data;
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [history, setHistory] = useState([createInitialData()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const { bpm, setBpm } = useSequencerSettings();

    const updateSongData = useCallback((newData, addToHistory = true) => {
        setSongData(currentData => {
            const nextData = typeof newData === 'function' ? newData(currentData) : newData;
            if (addToHistory) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(nextData);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
            return nextData;
        });
    }, [history, historyIndex]);

    const generateAndStoreWaveforms = useCallback((buffer, currentBpm, offset = 0) => {
        if (!buffer || currentBpm <= 0) return;
        const samplesPerSecond = buffer.sampleRate;
        const offsetInSamples = Math.floor(offset * samplesPerSecond);
        const channelData = buffer.getChannelData(0);
        const totalSamples = channelData.length;
        const duration = buffer.duration;
        const beatsInTrack = duration * (currentBpm / 60);
        const totalBars = Math.ceil(beatsInTrack / 16);
        const samplesPerBeat = totalSamples / beatsInTrack;
        const DOWNSAMPLE_FACTOR = 100;
        const newBars = { ...songData.bars };

        for (let bar = 0; bar < totalBars; bar++) {
            if (!newBars[bar]) newBars[bar] = createEmptyBar();
            for (let beat = 0; beat < 16; beat++) {
                const beatIndexGlobal = (bar * 16) + beat;
                const startSample = offsetInSamples + Math.floor(beatIndexGlobal * samplesPerBeat);
                const endSample = Math.floor(startSample + samplesPerBeat);
                if (startSample >= totalSamples) continue;
                const segment = channelData.slice(startSample, endSample);
                const waveformPoints = [];
                const step = Math.max(1, Math.floor(segment.length / DOWNSAMPLE_FACTOR));
                for (let i = 0; i < segment.length; i += step) {
                    const chunk = segment.slice(i, i + step);
                    let maxVal = 0;
                    for (let j = 0; j < chunk.length; j++) {
                        if (Math.abs(chunk[j]) > maxVal) maxVal = Math.abs(chunk[j]);
                    }
                    waveformPoints.push(maxVal);
                }
                newBars[bar][beat].waveform = waveformPoints;
            }
        }
        updateSongData(prev => ({ ...prev, bars: newBars }), false);
    }, [updateSongData, songData.bars]);

    const loadAudioFile = async (event) => {
        const file = event.target.files[0];
        if (!file || !audioContext) return;
        try {
            if (audioContext.state === 'suspended') await audioContext.resume();
            const arrayBuffer = await file.arrayBuffer();
            const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer);
            const musicTempo = new MusicTempo(decodedAudioData.getChannelData(0));
            const detectedBpm = Math.round(musicTempo.tempo);
            
            setBpm(detectedBpm);
            generateAndStoreWaveforms(decodedAudioData, detectedBpm, 0);

            updateSongData(prev => ({ 
                ...prev, 
                audioBuffer: decodedAudioData, 
                audioFileName: file.name,
                gridOffset: 0
            }), true);
        } catch (error) { console.error("Error processing audio file:", error); }
    };

    const setGridStartTime = useCallback((newOffset) => {
        if (songData.audioBuffer && bpm > 0) {
            generateAndStoreWaveforms(songData.audioBuffer, bpm, newOffset);
            updateSongData(prev => ({ ...prev, gridOffset: newOffset }), true);
        }
    }, [songData.audioBuffer, bpm, generateAndStoreWaveforms, updateSongData]);

    const getBeatData = useCallback((barIndex, beatIndex) => {
        return songData.bars?.[barIndex]?.[beatIndex] || { pose: createEmptyPose(), sounds: [] };
    }, [songData]);
    
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

    const addSoundToBeat = useCallback((barIndex, beatIndex, soundUrl) => {
        updateSongData(prevData => {
            // Deep copy to avoid mutation
            const newData = JSON.parse(JSON.stringify(prevData));
            const beat = newData.bars[barIndex]?.[beatIndex];

            if (beat) {
                // Ensure the sounds array exists
                if (!beat.sounds) {
                    beat.sounds = [];
                }
                // Check for duplicates and limit to 4 sounds
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundUrl)) {
                    beat.sounds.push(soundUrl);
                }
            }
            return newData;
        }, true); // Add this change to history
    }, [updateSongData]);

    const removeSoundFromBeat = useCallback((barIndex, beatIndex, soundUrlToRemove) => {
        updateSongData(prevData => {
            // Deep copy to avoid mutation
            const newData = JSON.parse(JSON.stringify(prevData));
            const beat = newData.bars[barIndex]?.[beatIndex];
            
            // Filter out the sound to be removed
            if (beat?.sounds) {
                beat.sounds = beat.sounds.filter(s => s !== soundUrlToRemove);
            }

            return newData;
        }, true); // Add this change to history
    }, [updateSongData]);

    const setPoseForBeat = useCallback((barIndex, beatIndex, pose) => {
        updateSongData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (!newData.bars[barIndex]) newData.bars[barIndex] = createEmptyBar();
            // Ensure pose data is not null before assigning
            newData.bars[barIndex][beatIndex].pose = pose || createEmptyPose(); 
            return newData;
        }, false); 
    }, [updateSongData]);

    const triggerBeat = useCallback((bar, beat) => {
        const beatData = getBeatData(bar, beat);
        if (!beatData) return;
        
        // Play layered sounds from the sound bank
        if (beatData.sounds?.length > 0) {
            beatData.sounds.forEach(soundUrl => playSound(soundUrl));
        }

        // --- FIX: Use the imported utility function to play the main audio track slice ---
        if (songData.audioBuffer) {
             playAudioSliceUtil(songData.audioBuffer, bpm, songData.gridOffset, bar, beat);
        }
    }, [getBeatData, songData.audioBuffer, bpm, songData.gridOffset]);

    const value = {
        songData,
        getBeatData,
        setPoseForBeat,
        setGridStartTime,
        loadAudioFile,
        onSave, triggerBeat,
        onLoad, addSoundToBeat,
        removeSoundFromBeat,
        triggerBeat,
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