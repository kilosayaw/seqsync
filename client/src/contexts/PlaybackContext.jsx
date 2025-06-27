import React, { createContext, useState, useCallback, useMemo, useContext, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSequence } from './SequenceContext';
import { useUIState } from './UIStateContext';
import { playSound, preloadSounds } from '../utils/audioManager';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE, TAP_TEMPO_MIN_TAPS, TAP_TEMPO_MAX_INTERVAL_MS } from '../utils/constants';

const PlaybackContext = createContext(null);

export const PlaybackProvider = ({ children }) => {
    // --- State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [skipInterval, setSkipInterval] = useState(16);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentBar, setCurrentBar] = useState(0);
    const tapTempoDataRef = useRef({ timestamps: [], timer: null });

    // --- CONSUME from other contexts ---
    const { songData, bpm, setBpm, timeSignature } = useSequence();
    const { currentSelectedKitObject } = useUIState();

    // Preload sounds whenever the selected kit changes
    useEffect(() => {
        if (currentSelectedKitObject?.sounds) {
            // Assuming preloadSounds takes an array of URLs
            preloadSounds(currentSelectedKitObject.sounds.map(s => s.url));
        }
    }, [currentSelectedKitObject]);

    // --- MAIN PLAYBACK LOOP ---
    useEffect(() => {
        if (!isPlaying) return;

        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        if (timePerStep <= 0 || !isFinite(timePerStep)) return;

        const interval = setInterval(() => {
            const soundsToPlay = songData[currentBar]?.beats[currentStep]?.sounds || [];
            if (soundsToPlay.length > 0 && currentSelectedKitObject?.sounds) {
                const kitSounds = currentSelectedKitObject.sounds;
                soundsToPlay.forEach(soundName => {
                    const sound = kitSounds.find(s => s.name === soundName);
                    if (sound?.url) {
                        playSound(sound.url);
                    }
                });
            }
            
            setCurrentStep(prevStep => {
                const nextStep = (prevStep + 1) % UI_PADS_PER_BAR;
                if (nextStep === 0) {
                    setCurrentBar(prevBar => (prevBar + 1) % songData.length);
                }
                return nextStep;
            });

        }, timePerStep * 1000);

        return () => clearInterval(interval);
    }, [isPlaying, bpm, timeSignature, currentStep, currentBar, songData, currentSelectedKitObject]);

    // --- Handlers ---
    const handlePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);
    const handleStop = useCallback(() => {
        setIsPlaying(false);
        setIsRecording(false);
        setCurrentStep(0);
        setCurrentBar(0);
    }, []);
    const handleRecord = useCallback(() => {
        setIsRecording(prev => !prev);
        if (!isPlaying) {
            setIsPlaying(true);
        }
    }, [isPlaying]);
    
    const handleSkipIntervalChange = useCallback((newInterval) => setSkipInterval(parseInt(newInterval, 10)), []);
    
    const handleTapTempo = useCallback(() => {
        const now = performance.now();
        const currentTaps = tapTempoDataRef.current.timestamps;
        if (tapTempoDataRef.current.timer) clearTimeout(tapTempoDataRef.current.timer);
        
        currentTaps.push(now);
        
        const processTaps = () => {
            const ts = tapTempoDataRef.current.timestamps;
            if (ts.length >= TAP_TEMPO_MIN_TAPS) {
                const intervals = [];
                for (let i = 1; i < ts.length; i++) intervals.push(ts[i] - ts[i - 1]);
                
                const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
                if (avgInterval > 50 && avgInterval < TAP_TEMPO_MAX_INTERVAL_MS) {
                    const newBPM = Math.round(60000 / avgInterval);
                    setBpm(newBPM);
                    toast.info(`Tempo set to ~${newBPM} BPM`);
                } else {
                    toast.warn("Tap tempo intervals too erratic.");
                }
            }
            tapTempoDataRef.current.timestamps = [];
            tapTempoDataRef.current.timer = null;
        };
        
        tapTempoDataRef.current.timer = setTimeout(processTaps, TAP_TEMPO_MAX_INTERVAL_MS);
    }, [setBpm]);

    // CORRECTED: The `totalBars` parameter has been removed.
    const handleSkip = useCallback((direction) => {
        const totalBars = songData.length;
        const wasPlaying = isPlaying;
        if (wasPlaying) setIsPlaying(false);

        let numStepsToSkip;
        if (skipInterval === 1) {
            numStepsToSkip = direction > 0 ? (UI_PADS_PER_BAR - currentStep) || UI_PADS_PER_BAR : currentStep > 0 ? currentStep : UI_PADS_PER_BAR;
        } else {
            numStepsToSkip = UI_PADS_PER_BAR / skipInterval;
        }

        let totalCurrentStep = (currentBar * UI_PADS_PER_BAR) + currentStep;
        let totalNewStep = totalCurrentStep + (direction * numStepsToSkip);
        const totalSequenceSteps = totalBars * UI_PADS_PER_BAR;

        totalNewStep = (totalNewStep + totalSequenceSteps) % totalSequenceSteps;
        
        const newBar = Math.floor(totalNewStep / UI_PADS_PER_BAR);
        const newStep = totalNewStep % UI_PADS_PER_BAR;

        setCurrentBar(newBar);
        setCurrentStep(newStep);
        
        document.dispatchEvent(new CustomEvent('playbackSkip', { detail: { newBar, newStep }}));

        if (wasPlaying) setTimeout(() => setIsPlaying(true), 50);

    }, [isPlaying, currentBar, currentStep, skipInterval, songData]);

    // --- Value Object ---
    const value = useMemo(() => ({
        isPlaying, isRecording, skipInterval, currentStep, currentBar,
        handlePlayPause, handleStop, handleRecord,
        handleTapTempo, handleSkip, handleSkipIntervalChange,
        setCurrentStep, setCurrentBar
    }), [isPlaying, isRecording, skipInterval, currentStep, currentBar, handlePlayPause, handleStop, handleRecord, handleTapTempo, handleSkip, handleSkipIntervalChange]);

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};

export const usePlayback = () => {
    const context = useContext(PlaybackContext);
    if (context === undefined) throw new Error('usePlayback must be used within a PlaybackProvider');
    return context;
};