import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'; // <-- DEFINITIVE FIX: useMemo ADDED
import { useSequence } from './SequenceContext';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../utils/constants';

const PlaybackContext = createContext(null);

export const PlaybackProvider = ({ children }) => {
    const { songData, bpm, timeSignature } = useSequence();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentBar, setCurrentBar] = useState(0);
    const timerRef = useRef(null);

    const handlePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);
    const handleRecord = useCallback(() => setIsRecording(prev => !prev), []);
    const handleStop = useCallback(() => {
        setIsPlaying(false);
        setIsRecording(false);
        setCurrentStep(0);
        setCurrentBar(0);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);
    
    useEffect(() => {
        if (isPlaying) {
            const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
            const interval = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar) * 1000;
            timerRef.current = setInterval(() => {
                setCurrentStep(prevStep => {
                    const nextStep = (prevStep + 1) % UI_PADS_PER_BAR;
                    if (nextStep === 0) {
                        setCurrentBar(prevBar => (prevBar + 1) % songData.length);
                    }
                    return nextStep;
                });
            }, interval);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, bpm, timeSignature, songData.length]);

    const value = useMemo(() => ({
        isPlaying, isRecording, 
        currentStep, currentBar,
        handlePlayPause, handleStop, handleRecord,
        handleTapTempo: () => {},
        handleSkip: () => {},
        handleSkipIntervalChange: () => {},
    }), [isPlaying, isRecording, currentStep, currentBar, handlePlayPause, handleStop, handleRecord]);

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