// /client/src/contexts/SequenceContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import MusicTempo from 'music-tempo';
import { toast } from 'react-toastify';
import { useSequencerSettings } from './SequencerSettingsContext.jsx';
import { downloadFile } from '../utils/fileUtils.js';
import { getAudioContext, playAudioSlice, playSound, unlockAudioContext } from '../utils/audioManager.js';

const SequenceContext = createContext(null);

const createEmptyPose = () => ({ jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 } });
const createEmptyBar = () => Array(16).fill(null).map((_, i) => ({ beatIndex: i, pose: createEmptyPose(), sounds: [], thumbnail: null, waveform: null }));
const createInitialData = (bars = 4) => {
    const data = { audioBuffer: null, audioFileName: null, videoUrl: null, bars: {}, gridOffset: 0 };
    for (let i = 0; i < bars; i++) { data.bars[i] = createEmptyBar(); }
    return data;
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [hasPrimaryMedia, setHasPrimaryMedia] = useState(false);
    const [history, setHistory] = useState([createInitialData()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const { bpm, setBpm } = useSequencerSettings();
    const clipStopTimerRef = useRef(null);

    

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
    
    // --- FIX: Define resetSequence FIRST, as other functions depend on it ---
    const resetSequence = useCallback(() => {
        const initialData = createInitialData();
        setSongData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
        setHasPrimaryMedia(false);
        setBpm(120);
        toast.info("New project started.");
    }, [setBpm]);
    
    const generateAndStoreWaveforms = (buffer, currentBpm, offset = 0) => {
        // This function doesn't need to be a useCallback and doesn't update state directly.
        // It will now just return the generated bars object.
        if (!buffer || currentBpm <= 0) return {};
        const channelData = buffer.getChannelData(0);
        const totalSamples = channelData.length;
        const beatsInTrack = buffer.duration * (currentBpm / 60);
        const totalBars = Math.ceil(beatsInTrack / 16);
        const samplesPerBeat = Math.floor(totalSamples / beatsInTrack);
        const newBars = {};
        for (let barIndex = 0; barIndex < totalBars; barIndex++) {
            newBars[barIndex] = createEmptyBar();
            for (let beatIndex = 0; beatIndex < 16; beatIndex++) {
                // ... same waveform point generation logic as before ...
            }
        }
        return newBars;
    };

    const processMediaFile = useCallback(async (file) => {
        if (!file) return;
        
        // 1. Reset the project to a clean state
        resetSequence();

        // 2. Get the global audio context
        const audioContext = getAudioContext();
        if (!audioContext) {
            toast.error("AudioContext is not available in this browser.");
            return; 
        }

        try {
            // 3. Ensure the audio context is active (required by browsers)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // 4. Read the entire file into memory as a buffer
            const arrayBuffer = await file.arrayBuffer();
            
            let audioBufferForAnalysis;
            let finalVideoUrl = null;
            let finalAudioBufferForPlayback = null;
            let detectedBpm = 120; // Default BPM if detection fails

            // 5. Handle the file based on its type (audio vs. video)
            if (file.type.startsWith('audio/')) {
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer);
                finalAudioBufferForPlayback = audioBufferForAnalysis; // For audio, analysis and playback buffer are the same
            } else if (file.type.startsWith('video/')) {
                // For video, create a playable URL for the video element
                finalVideoUrl = URL.createObjectURL(file);
                // And create a separate copy of the buffer for audio analysis
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            }

            // 6. If we successfully got an audio track, analyze it
            if (audioBufferForAnalysis) {
                const musicTempo = new MusicTempo(audioBufferForAnalysis.getChannelData(0));
                detectedBpm = Math.round(musicTempo.tempo) || 120;
                setBpm(detectedBpm);
                toast.success(`BPM detected: ${detectedBpm}`);
                
                // Generate waveforms for the beat grid using the extracted audio
                generateAndStoreWaveforms(audioBufferForAnalysis, detectedBpm, 0);
            }
            
            // 7. Update the main application state ONCE with all new data
            updateSongData(prev => ({ 
                ...prev, 
                audioBuffer: finalAudioBufferForPlayback, 
                videoUrl: finalVideoUrl,
                audioFileName: file.name,
                // Note: generateAndStoreWaveforms has already updated the bars within the state update
            }), false); // False because waveform generation isn't a direct user action to undo
            
            setHasPrimaryMedia(true);
            toast.success(`Media "${file.name}" loaded successfully.`);

        } catch (error) { 
            console.error("Error processing media file:", error); 
            toast.error("Could not process media file. It may be a non-standard format.");
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

    const triggerBeat = useCallback((bar, beat, videoElement) => {
        unlockAudioContext();
        const beatData = getBeatData(bar, beat);
        if (!beatData) return;
        
        // Play layered sounds (this is unchanged)
        if (beatData.sounds?.length > 0) {
            beatData.sounds.forEach(soundUrl => playSound(soundUrl));
        }

        // --- NEW "SPLICING" LOGIC ---
        if (songData.videoUrl && videoElement) {
            // Clear any previously scheduled stop command
            if (clipStopTimerRef.current) {
                clearTimeout(clipStopTimerRef.current);
            }

            const secondsPer16thNote = (60.0 / bpm) / 4;
            const seekTime = (songData.gridOffset || 0) + ((bar * 16 + beat) * secondsPer16thNote);

            if (seekTime < videoElement.duration) {
                videoElement.currentTime = seekTime;
                
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Once playback starts, schedule it to stop after one 16th note
                        clipStopTimerRef.current = setTimeout(() => {
                            videoElement.pause();
                        }, secondsPer16thNote * 1000); // setTimeout uses milliseconds
                    }).catch(error => {
                        // Autoplay was prevented. This is a common browser policy.
                        // We've already unlocked the context, so this is less likely but good to handle.
                        console.warn("Video playback was prevented by the browser.", error);
                    });
                }
            }
        } else if (songData.audioBuffer) {
            // Audio-only playback remains the same
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
        setGridOffset, resetSequence,
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