/* @refresh skip */
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSequencerSettings } from './SequencerSettingsContext';
import { getAudioContext, unlockAudioContext, playSound, preloadSounds } from '../utils/audioManager';

const PlaybackContext = createContext(null);

// --- FIX: Accept triggerBeat and setPoseForBeat as props to break the circular dependency ---
export const PlaybackProvider = ({ children, triggerBeat, setPoseForBeat }) => {
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
    
    // --- FIX: We only need useSequencerSettings now, no useSequence ---
    const { bpm, setBpm } = useSequencerSettings();
    
    // This hook no longer has any external context dependencies that create a loop.
    // It is now a self-contained playback engine.

    const getLivePose = useCallback(() => livePoseRef.current, []);
    const updateLivePose = (pose) => { livePoseRef.current = pose; };

    const togglePlay = useCallback(() => {
        unlockAudioContext();
        const context = getAudioContext();
        if (!context) return;

        setIsPlaying(prev => {
            const nextIsPlaying = !prev;
            if (nextIsPlaying) {
                startTimeRef.current = context.currentTime;
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
        // ... (tapTempo logic remains the same)
        unlockAudioContext();
        const now = Date.now();
        const timestamps = tapTimestamps.current;
        timestamps.push(now);
        if (timestamps.length > 4) timestamps.shift();
        if (timestamps.length > 1) {
            const intervals = [];
            for (let i = 1; i < timestamps.length; i++) { intervals.push(timestamps[i] - timestamps[i-1]); }
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            if (averageInterval > 0) {
                const calculatedBpm = 60000 / averageInterval;
                setBpm(Math.round(Math.max(40, Math.min(240, calculatedBpm))));
            }
        }
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => { tapTimestamps.current = []; }, 2000);
    }, [setBpm]);

    const toggleMetronome = () => setIsMetronomeEnabled(p => !p);

    useEffect(() => {
        preloadSounds([{ name: 'metronome', url: '/assets/sounds/metronome.wav' }]);
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }
        
        const audioContext = getAudioContext();
        if (!audioContext) return;

        const tick = () => {
            const currentElapsedTime = audioContext.currentTime - startTimeRef.current;
            const secondsPerBeat = 60.0 / bpm;
            
            if (secondsPerBeat > 0) {
                const beatsNow = Math.floor(currentElapsedTime / secondsPerBeat);

                if (beatsNow > totalBeatsElapsedRef.current) {
                    totalBeatsElapsedRef.current = beatsNow;
                    
                    const totalBars = 4; // This should be dynamic later
                    const newCurrentStep = beatsNow % 16;
                    const newCurrentBar = Math.floor(beatsNow / 16) % totalBars;
                    
                    // --- FIX: Ensure state updates are happening correctly ---
                    setCurrentBar(newCurrentBar);
                    setCurrentStep(newCurrentStep);

                    if (triggerBeat) {
                        triggerBeat(newCurrentBar, newCurrentStep);
                    }

                    if (isMetronomeEnabled && newCurrentStep % 4 === 0) {
                        playSound('/assets/sounds/metronome.wav');
                    }
                    
                    if (isRecording && setPoseForBeat) {
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
        return () => {
             if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, isRecording, bpm, isMetronomeEnabled, triggerBeat, setPoseForBeat, getLivePose]);
    
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