import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSequence } from './SequenceContext';
import { useSequencerSettings } from './SequencerSettingsContext';
import { playSound, preloadSounds, unlockAudioContext } from '../utils/audioManager';
import { playAudioSlice as playAudioSliceUtil } from '../utils/audioUtils';

const PlaybackContext = createContext(null);
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const PlaybackProvider = ({ children }) => {
    // --- STATE & REFS ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentBar, setCurrentBar] = useState(0);
    const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(true);

    const startTimeRef = useRef(0);
    const totalBeatsElapsedRef = useRef(0);
    const animationFrameId = useRef(null);
    const livePoseRef = useRef(null);
    const tapTimestamps = useRef([]);
    const tapTimeoutRef = useRef(null);
    
    // --- HOOKS ---
    const { songData, setPoseForBeat, triggerBeat } = useSequence();
    const { bpm, setBpm } = useSequencerSettings();

    // --- FUNCTION DEFINITIONS ---
    const getLivePose = useCallback(() => livePoseRef.current, []);
    const updateLivePose = (pose) => {
        livePoseRef.current = pose;
    };

    const togglePlay = useCallback(() => {
        unlockAudioContext();
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
    }, []);

    const toggleRecord = useCallback(() => {
        setIsRecording(prev => {
            if (!prev && !isPlaying) {
                togglePlay();
            }
            return !prev;
        });
    }, [isPlaying, togglePlay]);

    const tapTempo = useCallback(() => {
        unlockAudioContext();
        const now = Date.now();
        const timestamps = tapTimestamps.current;
        timestamps.push(now);
        if (timestamps.length > 4) timestamps.shift();
        if (timestamps.length > 1) {
            const intervals = [];
            for (let i = 1; i < timestamps.length; i++) {
                intervals.push(timestamps[i] - timestamps[i-1]);
            }
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            if (averageInterval > 0) {
                const calculatedBpm = 60000 / averageInterval;
                setBpm(Math.max(40, Math.min(240, calculatedBpm)));
            }
        }
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => { tapTimestamps.current = []; }, 2000);
    }, [setBpm]);

    const toggleMetronome = () => setIsMetronomeEnabled(p => !p);

    // --- EFFECTS ---
    useEffect(() => {
        preloadSounds([{ name: 'metronome', url: '/assets/sounds/metronome.wav' }]);
    }, []);

    // --- FULL IMPLEMENTATION of Main Playback & Recording Loop ---
    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(animationFrameId.current);
            return;
        }

        const tick = () => {
            const currentElapsedTime = audioContext.currentTime - startTimeRef.current;
            const secondsPerBeat = 60.0 / bpm;
            
            if (secondsPerBeat > 0) {
                const beatsNow = Math.floor(currentElapsedTime / secondsPerBeat);
                if (beatsNow > totalBeatsElapsedRef.current) {
                    totalBeatsElapsedRef.current = beatsNow;
                    
                    const totalBars = Object.keys(songData.bars).length || 1;
                    const newCurrentStep = beatsNow % 16;
                    const newCurrentBar = Math.floor(beatsNow / 16) % totalBars;
                    
                    setCurrentBar(newCurrentBar);
                    setCurrentStep(newCurrentStep);

                    triggerBeat(newCurrentBar, newCurrentStep);

                    if (isMetronomeEnabled) {
                        playSound('/assets/sounds/metronome.wav');
                    }
                    
                    if (isRecording) {
                        const poseToRecord = getLivePose();
                        if (poseToRecord) {
                            setPoseForBeat(newCurrentBar, newCurrentStep, poseToRecord);
                        }
                    }
                }
            }
            animationFrameId.current = requestAnimationFrame(tick);
        };

        animationFrameId.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [isPlaying, isRecording, bpm, isMetronomeEnabled, songData, setPoseForBeat, getLivePose, triggerBeat]);
    
    // --- CONTEXT VALUE ---
    const value = {
        isPlaying, isRecording, currentStep, currentBar,
        isMetronomeEnabled,
        togglePlay,
        toggleRecord,
        toggleMetronome,
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