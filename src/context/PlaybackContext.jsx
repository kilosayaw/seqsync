// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMedia } from './MediaContext';
import { useSequence } from './SequenceContext';
import * as Tone from 'tone';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [preRollCount, setPreRollCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [bpm, setBpm] = useState(120);
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(0);

    const { wavesurferInstance, duration, detectedBpm } = useMedia();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const metronome = useRef(new Tone.MembraneSynth().toDestination());

    // Sync bpm with detectedBpm only once when media is loaded
    useEffect(() => {
        if (detectedBpm) {
            setBpm(detectedBpm);
        }
    }, [detectedBpm]);

    // ... handleAudioProcess, seekToTime, togglePlay, handleRecord are unchanged ...
    const handleAudioProcess = useCallback((time) => { /*...*/ });
    useEffect(() => { /*...*/ });
    const seekToTime = useCallback((time) => { /*...*/ });
    const togglePlay = useCallback(() => { /*...*/ });
    const handleRecord = useCallback(() => { /*...*/ });

    const value = { 
        isPlaying, currentTime, bpm, 
        setBpm, // EXPORT setBpm so the tap tempo hook can use it
        currentBar, currentBeat,
        isRecording, preRollCount,
        togglePlay, seekToTime, handleRecord,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};