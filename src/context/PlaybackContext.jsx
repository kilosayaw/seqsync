// src/context/PlaybackContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext';
import { useSequence } from './SequenceContext';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bpm, setBpm] = useState(120);
    
    // CRUCIAL ADDITION: State for the live bar and beat
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(0);

    const { wavesurferInstance, duration, detectedBpm } = useMedia();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();

    // Sync local BPM with detected BPM from media
    useEffect(() => { if (detectedBpm) setBpm(detectedBpm); }, [detectedBpm]);

    const handleAudioProcess = useCallback((time) => {
        setCurrentTime(time);

        // Don't calculate if not playing or if data isn't ready
        if (!isPlaying || !barStartTimes || barStartTimes.length === 0 || !bpm || bpm <= 0) return;

        // Find which bar we're in
        let barIndex = barStartTimes.findIndex(startTime => startTime > time);
        if (barIndex === -1) barIndex = barStartTimes.length;
        barIndex -= 1;
        if (barIndex < 0) barIndex = 0;
        
        setCurrentBar(barIndex + 1);

        // Calculate the 16th-note beat within that bar
        const timeInBar = time - barStartTimes[barIndex];
        const timePerSixteenth = (60 / bpm) / 4;
        
        if (timePerSixteenth > 0) {
            const beatInBar = Math.floor(timeInBar / timePerSixteenth);
            // Ensure beat number is always within the 0-15 range for a bar
            setCurrentBeat(beatInBar % STEPS_PER_BAR);
        } else {
            setCurrentBeat(0);
        }
    }, [isPlaying, barStartTimes, bpm, STEPS_PER_BAR]);

    // Set up all wavesurfer event listeners
    useEffect(() => {
        const ws = wavesurferInstance;
        if (!ws) return;
        ws.on('audioprocess', handleAudioProcess);
        ws.on('seeking', () => handleAudioProcess(ws.getCurrentTime())); // Recalculate on seek
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => { 
            setIsPlaying(false); 
            setCurrentTime(0);
            setCurrentBar(1);
            setCurrentBeat(0);
        });
        return () => { ws.unAll(); }; // Clean up all listeners on unmount
    }, [wavesurferInstance, handleAudioProcess]);

    const seekToTime = useCallback((time) => {
        if (wavesurferInstance && duration > 0) {
            const seekPosition = Math.max(0, Math.min(time, duration));
            wavesurferInstance.setTime(seekPosition);
            // Manually call the process handler to update bar/beat immediately on seek
            handleAudioProcess(seekPosition); 
        }
    }, [wavesurferInstance, duration, handleAudioProcess]);

    const togglePlay = useCallback(() => {
        if (wavesurferInstance) {
            wavesurferInstance.playPause();
        }
    }, [wavesurferInstance]);
    
    const value = { 
        isPlaying, currentTime, bpm, 
        currentBar, // Expose live bar
        currentBeat, // Expose live beat
        setBpm, // Expose for tap tempo
        togglePlay,
        seekToTime
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};