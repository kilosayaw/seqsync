import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSequence } from './SequenceContext';
import { useSequencerSettings } from './SequencerSettingsContext';
import { playSound } from '../utils/audioManager';
import { playAudioSlice as playAudioSliceUtil } from '../utils/audioUtils';

const PlaybackContext = createContext(null);
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentBar, setCurrentBar] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(true);

    const metronomeBufferRef = useRef(null);
    const startTimeRef = useRef(null);
    const visualTimerRef = useRef(null);
    const livePoseRef = useRef(null);
    const totalBeatsElapsedRef = useRef(0);
    const lastRecordedStepRef = useRef(null);
    const tapTimestamps = useRef([]);
    const tapTimeoutRef = useRef(null);

    const { songData, setPoseForBeat } = useSequence();
    const { bpm, setBpm } = useSequencerSettings();

    const getLivePose = useCallback(() => livePoseRef.current, []);

    const updateLivePose = (pose) => {
        livePoseRef.current = pose;
    };

    useEffect(() => {
        const loadMetronomeSound = async () => {
            try {
                if (audioContext.state === 'suspended') await audioContext.resume();
                const response = await fetch('/assets/sounds/metronome.wav');
                const arrayBuffer = await response.arrayBuffer();
                metronomeBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);
            } catch (error) { console.error('[Metronome] Failed to load sound:', error); }
        };
        loadMetronomeSound();
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(visualTimerRef.current);
            return;
        }
        const tick = () => {
            const now = audioContext.currentTime;
            const currentElapsedTime = now - startTimeRef.current;
            setElapsedTime(currentElapsedTime);
            const secondsPerBeat = 60.0 / bpm;
            if (secondsPerBeat <= 0) {
                visualTimerRef.current = requestAnimationFrame(tick);
                return;
            };

            const beatsNow = Math.floor(currentElapsedTime / secondsPerBeat);
            if (beatsNow > totalBeatsElapsedRef.current) {
                totalBeatsElapsedRef.current = beatsNow;
                const totalBars = Object.keys(songData.bars).length || 1;
                const newCurrentStep = beatsNow % 16;
                const newCurrentBar = Math.floor(beatsNow / 16) % totalBars;
                
                setCurrentBar(newCurrentBar);
                setCurrentStep(newCurrentStep);

                if (isMetronomeEnabled) {
                    playSound('/assets/sounds/metronome.wav');
                }

                const beatData = songData.bars?.[newCurrentBar]?.[newCurrentStep];
                if (beatData) {
                    if (beatData.sounds?.length > 0) {
                        beatData.sounds.forEach(url => playSound(url));
                    }
                    if (songData.audioBuffer) {
                        playAudioSliceUtil(songData.audioBuffer, bpm, songData.gridOffset, newCurrentBar, newCurrentStep);
                    }
                }
            }
            visualTimerRef.current = requestAnimationFrame(tick);
        };
        visualTimerRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(visualTimerRef.current);
    }, [isPlaying, bpm, isMetronomeEnabled, songData]);

    useEffect(() => {
        if (!isPlaying || !isRecording) return;
        const currentGlobalStep = (currentBar * 16) + currentStep;
        if (currentGlobalStep !== lastRecordedStepRef.current) {
            const poseToRecord = getLivePose();
            if (poseToRecord) {
                setPoseForBeat(currentBar, currentStep, poseToRecord);
            }
            lastRecordedStepRef.current = currentGlobalStep;
        }
    }, [isPlaying, isRecording, currentBar, currentStep, setPoseForBeat, getLivePose]);


    const togglePlay = () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        setIsPlaying(prev => {
            const nextIsPlaying = !prev;
            if (nextIsPlaying) {
                startTimeRef.current = audioContext.currentTime;
                totalBeatsElapsedRef.current = -1;
            } else {
                setIsRecording(false);
            }
            return nextIsPlaying;
        });
    };
    
    const toggleRecord = () => {
        setIsRecording(prev => {
            if (!prev && !isPlaying) togglePlay();
            return !prev;
        });
    };
    
    
    const tapTempo = useCallback(() => {
        if (audioContext.state === 'suspended') audioContext.resume();
        const now = Date.now();
        tapTimestamps.current.push(now);
        if (tapTimestamps.current.length > 4) tapTimestamps.current.shift();
        if (tapTimestamps.current.length > 1) {
            const intervals = tapTimestamps.current.slice(1).map((t, i) => t - tapTimestamps.current[i]);
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const calculatedBpm = Math.round(60000 / averageInterval);
            if (calculatedBpm >= 40 && calculatedBpm <= 240) {
                setBpm(calculatedBpm);
            }
        }
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => { tapTimestamps.current = []; }, 2000);
    }, [setBpm]);
    
    const playAudioSlice = useCallback((bar, beat) => {
        if (!songData?.audioBuffer || bpm <= 0) return;
        const { audioBuffer, gridOffset } = songData;
        const secondsPerBeat = 60.0 / bpm;
        const startTime = (gridOffset || 0) + ((bar * 16 + beat) * secondsPerBeat);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0, startTime, secondsPerBeat);
    }, [bpm, songData]);

    const toggleMetronome = () => setIsMetronomeEnabled(p => !p);


    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(visualTimerRef.current);
            return;
        }
        const tick = () => {
            // ... existing timer logic ...
            const beatsNow = Math.floor(elapsed / secondsPerBeat);
            if (beatsNow > totalBeatsElapsedRef.current) {
                totalBeatsElapsedRef.current = beatsNow;
                const newCurrentStep = beatsNow % 16;
                const newCurrentBar = Math.floor(beatsNow / 16);
                setCurrentBar(newCurrentBar);
                setCurrentStep(newCurrentStep);

                if (isMetronomeEnabled) {
                    playSound('/assets/sounds/metronome.wav');
                }

                // --- FIX: PLAY ALL SOUNDS FOR THE CURRENT BEAT ---
                const beatData = songData.bars?.[newCurrentBar]?.[newCurrentStep];
                if (beatData) {
                    // Play layered sounds (e.g., TR-808 drums)
                    if (beatData.sounds && beatData.sounds.length > 0) {
                        beatData.sounds.forEach(soundUrl => playSound(soundUrl));
                    }
                    // Play the main audio track slice
                    if (beatData.audioSlice) {
                        playAudioSlice(newCurrentBar, newCurrentStep);
                    }
                }
            }
            visualTimerRef.current = requestAnimationFrame(tick);
        };
        visualTimerRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(visualTimerRef.current);
    }, [isPlaying, bpm, isMetronomeEnabled, songData]); 

    const value = {
        isPlaying, isRecording, currentStep, currentBar, elapsedTime,
        isMetronomeEnabled,
        togglePlay, toggleRecord, toggleMetronome,
        updateLivePose,
        getLivePose,
        tapTempo,
    };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => {
    const context = useContext(PlaybackContext);
    if (!context) throw new Error('usePlayback must be used within a PlaybackProvider');
    return context;
};