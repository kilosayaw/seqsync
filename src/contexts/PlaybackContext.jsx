import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSequence } from './SequenceContext';
import { useUIState } from './UIStateContext';

const PlaybackContext = createContext(null);
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentStep, setCurrentStep] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const { setPoseForBeat } = useSequence();
    const { setSelectedBar } = useUIState();

    const metronomeBufferRef = useRef(null);
    const startTimeRef = useRef(0);
    const visualTimerRef = useRef(null);
    const totalBeatsElapsedRef = useRef(0);
    const tapTimestamps = useRef([]);
    const tapTimeoutRef = useRef(null);
    const livePoseRef = useRef(null);
    
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

    useEffect(() => {
        // If playback is stopped, cancel any running animation frame and do nothing further.
        if (!isPlaying) {
            if (visualTimerRef.current) {
                cancelAnimationFrame(visualTimerRef.current);
            }
            return;
        }

        // The main "tick" function that runs on every frame.
        const tick = () => {
            const now = audioContext.currentTime;
            const elapsed = now - startTimeRef.current;
            setElapsedTime(elapsed);

            const secondsPerBeat = 60.0 / bpm;
            const totalBeatsNow = Math.floor(elapsed / secondsPerBeat);
            
            // This condition ensures we only fire events ONCE per beat.
            if (totalBeatsNow > totalBeatsElapsedRef.current) {
                totalBeatsElapsedRef.current = totalBeatsNow;
                
                // Calculate the current bar and the beat within that bar (0-15)
                const currentBar = Math.floor(totalBeatsNow / 16);
                const currentBeatInBar = totalBeatsNow % 16;
                
                // Update the UI state
                setSelectedBar(currentBar);
                setCurrentStep(currentBeatInBar);

                // Play the metronome sound if it's enabled
                if (isMetronomeEnabled && metronomeBufferRef.current) {
                    const source = audioContext.createBufferSource();
                    source.buffer = metronomeBufferRef.current;
                    source.connect(audioContext.destination);
                    source.start();
                }

                // --- "Pose Stamping" Logic ---
                // If recording is active, save the pose from the *previous* beat.
                if (isRecording && livePoseRef.current) {
                    // We calculate the previous beat's index to avoid timing issues.
                    const beatToRecord = (totalBeatsNow - 1) % 16;
                    const barToRecord = Math.floor((totalBeatsNow - 1) / 16);
                    
                    if (totalBeatsNow > 0) {
                        console.log(`[Recording] Stamping pose to Bar: ${barToRecord}, Beat: ${beatToRecord}`);
                        // The entire pose object, including zDisplacement and isFaceVisible, is saved.
                        setPoseForBeat(barToRecord, beatToRecord, livePoseRef.current);
                    }
                }
            }
            // Schedule the next frame
            visualTimerRef.current = requestAnimationFrame(tick);
        };

        // Start the loop
        visualTimerRef.current = requestAnimationFrame(tick);
        
        // Cleanup function: This runs when the component unmounts or dependencies change.
        return () => cancelAnimationFrame(visualTimerRef.current);

    }, [isPlaying, bpm, isMetronomeEnabled, isRecording, setPoseForBeat, setSelectedBar]); // Dependencies that trigger a re-run of this effect

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (newIsPlaying) {
            if (audioContext.state === 'suspended') audioContext.resume();
            startTimeRef.current = audioContext.currentTime;
            totalBeatsElapsedRef.current = -1; // Reset to ensure first beat fires correctly
            setCurrentStep(0);
            setSelectedBar(0);
            setElapsedTime(0);
        } else {
             // When stopping, also turn off recording
            setIsRecording(false);
        }
    };

    const toggleRecord = () => {
        const nextRecordingState = !isRecording;
        console.log(`[Playback] Toggling Record. New state: ${nextRecordingState ? 'ON' : 'OFF'}`);
        if (nextRecordingState && !isPlaying) {
            togglePlay(); // Start playing if we hit record and we're stopped
        }
        setIsRecording(nextRecordingState);
    };

    const updateLivePose = (pose) => {
        livePoseRef.current = pose;
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
        isPlaying,
        isRecording,
        bpm,
        setBpm,
        currentStep,
        elapsedTime,
        togglePlay,
        toggleRecord,
        updateLivePose,
        isMetronomeEnabled,
        toggleMetronome,
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