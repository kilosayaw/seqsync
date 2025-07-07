// src/context/PlaybackContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'; // ADDED useRef HERE
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
    
    // This line was causing the error because useRef was not imported
    const metronome = useRef(new Tone.MembraneSynth().toDestination());

    useEffect(() => { if (detectedBpm) setBpm(detectedBpm); }, [detectedBpm]);

    const handleAudioProcess = useCallback((time) => {
        setCurrentTime(time);
        if (!isPlaying || !barStartTimes || barStartTimes.length === 0 || !bpm || bpm <= 0) return;
        let barIndex = barStartTimes.findIndex(startTime => startTime > time);
        if (barIndex === -1) barIndex = barStartTimes.length;
        barIndex -= 1;
        if (barIndex < 0) barIndex = 0;
        setCurrentBar(barIndex + 1);
        const timeInBar = time - barStartTimes[barIndex];
        const timePerSixteenth = (60 / bpm) / 4;
        if (timePerSixteenth > 0) {
            const beatInBar = Math.floor(timeInBar / timePerSixteenth);
            setCurrentBeat(beatInBar % STEPS_PER_BAR);
        } else {
            setCurrentBeat(0);
        }
    }, [isPlaying, barStartTimes, bpm, STEPS_PER_BAR]);

    useEffect(() => {
        const ws = wavesurferInstance;
        if (!ws) return;
        ws.on('audioprocess', handleAudioProcess);
        ws.on('seeking', () => handleAudioProcess(ws.getCurrentTime()));
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => { 
            setIsPlaying(false); 
            setCurrentTime(0);
            setCurrentBar(1);
            setCurrentBeat(0);
        });
        return () => { ws.unAll(); };
    }, [wavesurferInstance, handleAudioProcess]);

    const seekToTime = useCallback((time) => {
        if (wavesurferInstance && duration > 0) {
            const seekPosition = Math.max(0, Math.min(time, duration));
            wavesurferInstance.setTime(seekPosition);
            handleAudioProcess(seekPosition);
        }
    }, [wavesurferInstance, duration, handleAudioProcess]);

    const togglePlay = useCallback(() => {
        if (wavesurferInstance) {
            wavesurferInstance.playPause();
        }
    }, [wavesurferInstance]);

    const handleRecord = useCallback(() => {
        if (isRecording || preRollCount > 0) return;

        let count = 4;
        // Trigger the first beat immediately
        metronome.current.triggerAttackRelease("C2", "8n", Tone.now());
        setPreRollCount(count);

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                metronome.current.triggerAttackRelease("C2", "8n", Tone.now());
                setPreRollCount(count);
            } else {
                clearInterval(interval);
                metronome.current.triggerAttackRelease("C3", "8n", Tone.now()); // Different sound for record start
                setPreRollCount(0);
                setIsRecording(true);
                console.log("RECORDING STARTED");
                // togglePlay(); // This can be enabled to start playback on record
            }
        }, (60 / bpm) * 1000); // Correct interval calculation in milliseconds

    }, [isRecording, preRollCount, bpm, togglePlay]);

    const value = { 
        isPlaying, currentTime, bpm, setBpm, currentBar, currentBeat,
        isRecording, preRollCount,
        togglePlay, seekToTime, handleRecord,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};