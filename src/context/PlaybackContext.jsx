import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext';
import { useUIState } from './UIStateContext';
import { useSequence } from './SequenceContext'; // Import useSequence

const PlaybackContext = createContext(null);

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] =useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentBeat, setCurrentBeat] = useState(0); // This is now the beat within the CURRENT BAR

    const { wavesurferRef, duration, detectedBpm } = useMedia();
    const { setSelectedBar } = useUIState();
    const { stepsPerBar } = useSequence(); // Get stepsPerBar from SequenceContext

    useEffect(() => {
        if (detectedBpm) {
            setBpm(detectedBpm);
        }
    }, [detectedBpm]);

    const handleAudioProcess = useCallback((time) => {
        setCurrentTime(time);
        
        const beatsPerSecond = bpm / 60;
        const totalSixteenths = Math.floor(time * beatsPerSecond * 4);

        // KEY CHANGE: Use dynamic stepsPerBar for playhead calculation
        const newBeat = totalSixteenths % stepsPerBar;
        const newBar = Math.floor(totalSixteenths / stepsPerBar) + 1;

        setCurrentBeat(newBeat);
        setSelectedBar(newBar);

    }, [bpm, setSelectedBar, stepsPerBar]); // Add stepsPerBar to dependencies

    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const subscriptions = [
            ws.on('play', () => setIsPlaying(true)),
            ws.on('pause', () => setIsPlaying(false)),
            ws.on('finish', () => setIsPlaying(false)),
            ws.on('audioprocess', handleAudioProcess),
            ws.on('seeking', handleAudioProcess)
        ];

        return () => {
            subscriptions.forEach(unsub => unsub());
        };
    }, [wavesurferRef, handleAudioProcess]);
    
    const togglePlay = useCallback(() => {
        wavesurferRef.current?.playPause();
    }, [wavesurferRef]);
    
    const seekToTime = useCallback((time) => {
        if (wavesurferRef.current && duration > 0) {
            wavesurferRef.current.setTime(time);
        }
    }, [wavesurferRef, duration]);

    const seekToBeat = useCallback((bar, beat) => {
        const totalSixteenths = ((bar - 1) * stepsPerBar) + beat;
        const time = totalSixteenths / ((bpm / 60) * 4);
        
        if (wavesurferRef.current && duration > 0 && time < duration) {
            wavesurferRef.current.setTime(time);
        }
    }, [wavesurferRef, bpm, duration, stepsPerBar]);

    const value = { 
        isPlaying, 
        isRecording,
        setIsRecording,
        bpm, 
        setBpm,
        currentTime,
        currentBeat,
        togglePlay,
        seekToTime,
        seekToBeat
    };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};