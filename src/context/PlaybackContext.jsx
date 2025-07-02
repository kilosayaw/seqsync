import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext';

const PlaybackContext = createContext(null);

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] =useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentTime, setCurrentTime] = useState(0);

    const { wavesurferRef, duration, detectedBpm } = useMedia();

    useEffect(() => { if (detectedBpm) setBpm(detectedBpm); }, [detectedBpm]);

    const handleAudioProcess = useCallback((time) => { setCurrentTime(time); }, []);

    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;
        const subscriptions = [
            ws.on('play', () => setIsPlaying(true)),
            ws.on('pause', () => setIsPlaying(false)),
            ws.on('finish', () => { setIsPlaying(false); setCurrentTime(0); }),
            ws.on('audioprocess', handleAudioProcess),
            ws.on('seeking', handleAudioProcess)
        ];
        return () => { subscriptions.forEach(unsub => unsub()); };
    }, [wavesurferRef, handleAudioProcess]);
    
    // EXPOSED: More granular controls
    const play = useCallback(() => { wavesurferRef.current?.play(); }, [wavesurferRef]);
    const pause = useCallback(() => { wavesurferRef.current?.pause(); }, [wavesurferRef]);
    const togglePlay = useCallback(() => { wavesurferRef.current?.playPause(); }, [wavesurferRef]);
    
    const seekToTime = useCallback((time) => {
        if (wavesurferRef.current && duration > 0) {
            const newTime = Math.max(0, Math.min(time, duration));
            wavesurferRef.current.setTime(newTime);
        }
    }, [wavesurferRef, duration]);
    
    const value = { 
        isPlaying, isRecording, setIsRecording,
        bpm, setBpm, currentTime,
        play, pause, togglePlay, // Expose new controls
        seekToTime,
    };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};