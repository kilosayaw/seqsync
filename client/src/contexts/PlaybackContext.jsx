import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const PlaybackContext = createContext(null);
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentStep, setCurrentStep] = useState(0);
    const [bar, setBar] = useState(1);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);
    
    const metronomeBufferRef = useRef(null);
    const startTimeRef = useRef(0);
    const visualTimerRef = useRef(null);
    const tapTimestamps = useRef([]);
    const tapTimeoutRef = useRef(null);

    useEffect(() => {
        const loadMetronomeSound = async () => {
            try {
                const response = await fetch('/assets/sounds/metronome.wav');
                const arrayBuffer = await response.arrayBuffer();
                metronomeBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);
                console.log('[Metronome] Sound loaded successfully.');
            } catch (error) { console.error('[Metronome] Failed to load sound:', error); }
        };
        loadMetronomeSound();
    }, []);

    // <<< REBUILT: A single, unified loop for all playback logic >>>
    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(visualTimerRef.current);
            return;
        }

        let lastStep = -1;
        const tick = () => {
            const now = audioContext.currentTime;
            const elapsed = now - startTimeRef.current;
            setElapsedTime(elapsed);

            const secondsPerBeat = 60.0 / bpm;
            const totalBeatsElapsed = Math.floor(elapsed / secondsPerBeat);
            const currentBeatInBar = totalBeatsElapsed % 16;
            
            // Only update state and play sound if the beat has changed
            if (currentBeatInBar !== lastStep) {
                setCurrentStep(currentBeatInBar);
                setBar(Math.floor(totalBeatsElapsed / 16) + 1);

                if (isMetronomeEnabled && metronomeBufferRef.current) {
                    const source = audioContext.createBufferSource();
                    source.buffer = metronomeBufferRef.current;
                    source.connect(audioContext.destination);
                    source.start();
                }
                lastStep = currentBeatInBar;
            }
            visualTimerRef.current = requestAnimationFrame(tick);
        };

        visualTimerRef.current = requestAnimationFrame(tick);
        
        return () => cancelAnimationFrame(visualTimerRef.current);
    }, [isPlaying, bpm, isMetronomeEnabled]); // This loop re-runs only if these key states change

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (newIsPlaying) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            // Reset and start clock
            startTimeRef.current = audioContext.currentTime;
            setCurrentStep(0);
            setBar(1);
            setElapsedTime(0);
        }
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
    }, []);

    const toggleMetronome = () => setIsMetronomeEnabled(p => !p);

    const value = {
        isPlaying, bpm, setBpm, currentStep, bar, elapsedTime,
        togglePlay, isMetronomeEnabled, toggleMetronome, tapTempo,
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