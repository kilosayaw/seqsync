import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSequence } from './SequenceContext';
import { useUIState } from './UIStateContext';

const PlaybackContext = createContext(null);
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentStep, setCurrentStep] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);

    const { songData, setPoseForBeat, setBeatThumbnail } = useSequence();
    const { selectedBar, setSelectedBar } = useUIState();

    const metronomeBufferRef = useRef(null);
    const startTimeRef = useRef(0);
    const visualTimerRef = useRef(null);
    const livePoseRef = useRef(null);
    const totalBeatsElapsedRef = useRef(0);
    const tapTimestamps = useRef([]);
    const tapTimeoutRef = useRef(null);
    const videoElementForCapture = useRef(null);

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

    // The main, unified playback and recording loop
    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(visualTimerRef.current);
            return;
        }

        const tick = () => {
            const now = audioContext.currentTime;
            const elapsed = now - startTimeRef.current;
            setElapsedTime(elapsed);

            const secondsPerBeat = 60.0 / bpm;
            const beatsNow = Math.floor(elapsed / secondsPerBeat);
            
            if (beatsNow > totalBeatsElapsedRef.current) {
                totalBeatsElapsedRef.current = beatsNow;
                
                const currentBar = Math.floor(beatsNow / 16);
                const currentBeatInBar = beatsNow % 16;
                
                if (currentBar !== selectedBar) setSelectedBar(currentBar);
                setCurrentStep(currentBeatInBar);

                // <<< FIX: Play metronome sound reliably on every beat change >>>
                if (isMetronomeEnabled && metronomeBufferRef.current) {
                    const source = audioContext.createBufferSource();
                    source.buffer = metronomeBufferRef.current;
                    source.connect(audioContext.destination);
                    source.start();
                }

                if (isRecording && livePoseRef.current) {
                    const barToRecord = Math.floor((beatsNow - 1) / 16);
                    const beatToRecord = (beatsNow - 1) % 16;
                    
                    if (beatsNow > 0) {
                        setPoseForBeat(barToRecord, beatToRecord, livePoseRef.current);
                        // Video thumbnail logic can be re-added here later
                    }
                }
            }
            visualTimerRef.current = requestAnimationFrame(tick);
        };
        visualTimerRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(visualTimerRef.current);
    // <<< FIX: Add isRecording to the dependency array >>>
    }, [isPlaying, bpm, isRecording, isMetronomeEnabled, selectedBar, setPoseForBeat, setSelectedBar]);

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (newIsPlaying) {
            if (audioContext.state === 'suspended') audioContext.resume();
            startTimeRef.current = audioContext.currentTime;
            totalBeatsElapsedRef.current = -1;
            setCurrentStep(0);
            setSelectedBar(0);
            setElapsedTime(0);
        } else {
            setIsRecording(false); // Always stop recording when playback stops
        }
    };
    
    const toggleRecord = () => {
        const nextRecordingState = !isRecording;
        console.log(`[Playback] Toggling Record. New state: ${nextRecordingState ? 'ON' : 'OFF'}`);
        // If we are starting to record, also ensure we are playing
        if (nextRecordingState && !isPlaying) {
            setIsPlaying(true);
        }
        setIsRecording(nextRecordingState);
    };

    const updateLivePose = (pose) => { livePoseRef.current = pose; };
    
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
        isPlaying, isRecording, bpm, setBpm, currentStep, elapsedTime,
        togglePlay, toggleRecord, updateLivePose,
        isMetronomeEnabled, toggleMetronome, tapTempo,
        setVideoElementForCapture: (el) => { videoElementForCapture.current = el; }
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