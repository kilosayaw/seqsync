// /client/src/contexts/SequenceContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import MusicTempo from 'music-tempo';
import { toast } from 'react-toastify';
import { useSequencerSettings } from './SequencerSettingsContext.jsx';
import { downloadFile } from '../utils/fileUtils.js';
import { getAudioContext, unlockAudioContext, playSound, playAudioSlice } from '../utils/audioManager.js';

const SequenceContext = createContext(null);

const createEmptyPose = () => ({
    jointInfo: {},
    grounding: { L: null, R: null, L_weight: 50, R_weight: 50 },
});

const createEmptyBar = () => Array(16).fill(null).map((_, i) => ({ beatIndex: i, pose: createEmptyPose(), sounds: [], thumbnail: null, waveform: null }));

const createInitialData = (bars = 4) => {
    const data = { 
        audioBuffer: null, 
        audioFileName: null, 
        videoUrl: null,
        bars: {}, 
        gridOffset: 0
    };
    for (let i = 0; i < bars; i++) {
        data.bars[i] = createEmptyBar();
    }
    return data;
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [hasPrimaryMedia, setHasPrimaryMedia] = useState(false);
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
        const channelData = buffer.getChannelData(0);
        const totalSamples = channelData.length;
        const beatsInTrack = buffer.duration * (currentBpm / 60);
        const totalBars = Math.ceil(beatsInTrack / 16);
        const samplesPerBeat = Math.floor(totalSamples / beatsInTrack);
        const newBars = {};
        for (let barIndex = 0; barIndex < totalBars; barIndex++) {
            newBars[barIndex] = createEmptyBar();
            for (let beatIndex = 0; beatIndex < 16; beatIndex++) {
                const beatIndexGlobal = (barIndex * 16) + beatIndex;
                const startSample = Math.floor((offset * buffer.sampleRate) + (beatIndexGlobal * samplesPerBeat));
                const endSample = startSample + samplesPerBeat;
                if (startSample >= totalSamples) continue;
                const segment = channelData.slice(startSample, endSample);
                const waveformPoints = [];
                const step = Math.max(1, Math.floor(segment.length / 100));
                for (let i = 0; i < segment.length; i += step) {
                    let maxVal = 0;
                    for (let j = 0; j < step; j++) {
                        if (i + j < segment.length) {
                           const val = Math.abs(segment[i + j]);
                           if (val > maxVal) maxVal = val;
                        }
                    }
                    waveformPoints.push(maxVal);
                }
                if (newBars[barIndex]?.[beatIndex]) {
                    newBars[barIndex][beatIndex].waveform = waveformPoints;
                }
            }
        }
        updateSongData(prev => ({ ...prev, bars: newBars }), false);
    }, [updateSongData]);

    const resetSequence = useCallback(() => {
        const initialData = createInitialData();
        setSongData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
        setHasPrimaryMedia(false);
        setBpm(120);
        toast.info("New project started.");
    }, [setBpm]);

    const processMediaFile = useCallback(async (file) => {
        if (!file) return;
        resetSequence();
        const audioContext = getAudioContext();
        if (!audioContext) {
            toast.error("AudioContext not available.");
            return;
        }

        try {
            if (audioContext.state === 'suspended') await audioContext.resume();
            const arrayBuffer = await file.arrayBuffer();
            let audioBufferForAnalysis;
            let finalVideoUrl = null;
            let finalAudioBufferForPlayback = null;

            if (file.type.startsWith('audio/')) {
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer);
                finalAudioBufferForPlayback = audioBufferForAnalysis;
            } else if (file.type.startsWith('video/')) {
                // For video, we decode its audio track for analysis
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer.slice(0));
                finalVideoUrl = URL.createObjectURL(file);
                // We can also store the audio buffer for video cueing if desired,
                // but for now, we'll use the video element's currentTime.
                // finalAudioBufferForPlayback = audioBufferForAnalysis;
            }

            if (audioBufferForAnalysis) {
                const musicTempo = new MusicTempo(audioBufferForAnalysis.getChannelData(0));
                const detectedBpm = Math.round(musicTempo.tempo);
                setBpm(detectedBpm);
                toast.success(`BPM detected: ${detectedBpm}`);
                
                // --- THIS IS THE FIX ---
                // Generate waveforms from the extracted/decoded audio REGARDLESS of file type.
                generateAndStoreWaveforms(audioBufferForAnalysis, detectedBpm, 0);
            }
            
            // Now update the state with all the processed data
            updateSongData(prev => ({ 
                ...prev, 
                audioBuffer: finalAudioBufferForPlayback, 
                videoUrl: finalVideoUrl,
                audioFileName: file.name 
            }), false);
            
            setHasPrimaryMedia(true);
            toast.success(`Media "${file.name}" loaded successfully.`);

        } catch (error) { 
            console.error("Error processing media file:", error); 
            toast.error("Could not process audio from file.");
        }
    }, [resetSequence, setBpm, generateAndStoreWaveforms, updateSongData]);

    const loadAudioFile = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (hasPrimaryMedia) {
            if (window.confirm("This will replace the current media and clear your sequence. Are you sure?")) {
                processMediaFile(file);
            } else {
                if(event.target) event.target.value = null;
                return;
            }
        } else {
            processMediaFile(file);
        }
        if(event.target) event.target.value = null;
    }, [hasPrimaryMedia, processMediaFile]);
    
    const getBeatData = useCallback((barIndex, beatIndex) => {
        const bar = songData.bars?.[barIndex];
        if (!bar) return { pose: createEmptyPose(), sounds: [] };
        return bar[beatIndex] || { pose: createEmptyPose(), sounds: [] };
    }, [songData]);

    const triggerBeat = useCallback((bar, beat, videoElement) => { // Accept videoElement as an argument
        unlockAudioContext();
        const beatData = getBeatData(bar, beat);
        if (!beatData) return;
        
        if (beatData.sounds?.length > 0) { /* ... */ }

        if (songData.videoUrl && videoElement) { // Use the passed-in element
            const secondsPerBeat = (60.0 / bpm) / 4;
            const seekTime = (songData.gridOffset || 0) + ((bar * 16 + beat) * secondsPerBeat);
            if (seekTime < videoElement.duration) {
                videoElement.currentTime = seekTime;
                videoElement.play();
            }
        } else if (songData.audioBuffer) {
            playAudioSlice(songData.audioBuffer, bpm, songData.gridOffset, bar, beat);
        }
    }, [getBeatData, songData.audioBuffer, songData.videoUrl, bpm, songData.gridOffset]);

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

    const setPoseForBeat = useCallback((barIndex, beatIndex, newPoseData) => {
        updateSongData(prevData => {
            const newBars = JSON.parse(JSON.stringify(prevData.bars));
            if (!newBars[barIndex]) newBars[barIndex] = createEmptyBar();
            const targetBeat = newBars[barIndex][beatIndex];
            targetBeat.pose = {
                ...targetBeat.pose,
                ...newPoseData,
                jointInfo: { ...(targetBeat.pose?.jointInfo || {}), ...(newPoseData.jointInfo || {}) },
                grounding: { ...(targetBeat.pose?.grounding || {}), ...(newPoseData.grounding || {}) }
            };
            return { ...prevData, bars: newBars };
        }, true);
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
            const dataToSave = { ...songData, audioBuffer: null, videoUrl: null };
            const dataStr = JSON.stringify(dataToSave, null, 2);
            const fileName = `sequence-${Date.now()}.seqsync.json`;
            downloadFile(dataStr, fileName, "application/json");
            toast.success("Sequence saved successfully!");
        } catch (error) {
            console.error("Failed to save sequence:", error);
            toast.error("Failed to save sequence.");
        }
    }, [songData]);

    const onLoad = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (loadedData && typeof loadedData.bars === 'object') {
                    const initialData = createInitialData();
                    const finalData = { ...initialData, ...loadedData, audioBuffer: null, videoUrl: null };
                    updateSongData(finalData, true);
                    setHasPrimaryMedia(false);
                    toast.success(`Sequence "${file.name}" loaded.`);
                } else { throw new Error("Invalid sequence file format."); }
            } catch (error) {
                console.error("Failed to load sequence file:", error);
                toast.error("Failed to load or parse sequence file.");
            }
        };
        reader.readAsText(file);
    }, [updateSongData]);

    const setGridOffset = useCallback((newOffset) => {
        updateSongData(prevData => {
            return {
                ...prevData,
                gridOffset: newOffset
            };
        }, true);
        toast.info(`Grid offset adjusted.`);
    }, [updateSongData]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const value = {
        songData, hasPrimaryMedia, loadAudioFile, resetSequence, getBeatData,
        setPoseForBeat, addSoundToBeat, removeSoundFromBeat, triggerBeat,
        onSave, onLoad, updateSongData, undo, redo, canUndo, canRedo,
        setGridOffset
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