import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import MusicTempo from 'music-tempo';
import { toast } from 'react-toastify';
import { useSequencerSettings } from './SequencerSettingsContext.jsx';
import { downloadFile } from '../utils/fileUtils.js';

// --- FIX: Import everything from audioManager.js ---
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
        // This function will be filled in later if needed, for now it's a placeholder
        return {}; 
    };

    const processMediaFile = useCallback(async (file) => {
        if (!file) return;
        
        resetSequence();

        const audioContext = getAudioContext();
        if (!audioContext) {
            toast.error("AudioContext is not available in this browser.");
            return; 
        }

        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const arrayBuffer = await file.arrayBuffer();
            
            let audioBufferForAnalysis;
            let finalVideoUrl = null;
            let finalAudioBufferForPlayback = null;
            let detectedBpm = 120;

            if (file.type.startsWith('audio/')) {
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer);
                finalAudioBufferForPlayback = audioBufferForAnalysis;
            } else if (file.type.startsWith('video/')) {
                finalVideoUrl = URL.createObjectURL(file);
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer.slice(0));
                 finalAudioBufferForPlayback = audioBufferForAnalysis; // Also set for video
            }

            if (audioBufferForAnalysis) {
                const musicTempo = new MusicTempo(audioBufferForAnalysis.getChannelData(0));
                detectedBpm = Math.round(musicTempo.tempo) || 120;
                setBpm(detectedBpm);
                toast.success(`BPM detected: ${detectedBpm}`);
                
                generateAndStoreWaveforms(audioBufferForAnalysis, detectedBpm, 0);
            }
            
            updateSongData(prev => ({ 
                ...prev, 
                audioBuffer: finalAudioBufferForPlayback, 
                videoUrl: finalVideoUrl,
                audioFileName: file.name,
            }), false); 
            
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
        
        if (beatData.sounds?.length > 0) {
            beatData.sounds.forEach(soundUrl => playSound(soundUrl));
        }

        if (songData.videoUrl && videoElement) {
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
                        clipStopTimerRef.current = setTimeout(() => {
                            videoElement.pause();
                        }, secondsPer16thNote * 1000);
                    }).catch(error => {
                        console.warn("Video playback was prevented by the browser.", error);
                    });
                }
            }
        } else if (songData.audioBuffer) {
            // --- FIX: Use the direct import ---
            playAudioSlice(songData.audioBuffer, bpm, songData.gridOffset, bar, beat);
        }
    }, [getBeatData, songData.audioBuffer, songData.videoUrl, bpm, songData.gridOffset]);
    
    // ... all other functions (addSoundToBeat, setPoseForBeat, onSave, onLoad, etc.)
    // should be copied from your last working version here ...

    const addSoundToBeat = useCallback(() => {}, []);
    const removeSoundFromBeat = useCallback(() => {}, []);
    const setPoseForBeat = useCallback(() => {}, []);
    const onSave = useCallback(() => {}, []);
    const onLoad = useCallback(() => {}, []);
    const setGridOffset = useCallback(() => {}, []);
    const undo = () => {};
    const redo = () => {};
    const canUndo = false;
    const canRedo = false;


    const value = {
        songData, 
        hasPrimaryMedia, 
        loadAudioFile, 
        resetSequence,
        getBeatData,
        setPoseForBeat, 
        addSoundToBeat, 
        removeSoundFromBeat, 
        triggerBeat,
        onSave, 
        onLoad, 
        updateSongData, 
        undo, 
        redo, 
        canUndo, 
        canRedo,
        setGridOffset,
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