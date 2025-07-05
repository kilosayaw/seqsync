import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext';
const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);
export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bpm, setBpm] = useState(120);
    const { wavesurferInstance, duration, detectedBpm } = useMedia();
    useEffect(() => { if (detectedBpm) setBpm(detectedBpm); }, [detectedBpm]);
    const handleAudioProcess = useCallback((time) => { setCurrentTime(time); }, []);
    useEffect(() => {
        const ws = wavesurferInstance;
        if (!ws) return;
        const subs = [
            ws.on('play', () => setIsPlaying(true)), ws.on('pause', () => setIsPlaying(false)),
            ws.on('finish', () => { setIsPlaying(false); setCurrentTime(0); }),
            ws.on('audioprocess', handleAudioProcess), ws.on('seeking', (time) => setCurrentTime(ws.getCurrentTime()))
        ];
        return () => { subs.forEach(unsub => unsub()); };
    }, [wavesurferInstance, handleAudioProcess]);
    const setPlaybackSpeed = useCallback((newBpm) => {
        setBpm(newBpm);
        if (wavesurferInstance) {
            const baseBpm = detectedBpm || 120;
            const rate = newBpm / baseBpm;
            wavesurferInstance.setPlaybackRate(rate);
        }
    }, [wavesurferInstance, detectedBpm]);
    const play = useCallback(() => { wavesurferInstance?.play(); }, [wavesurferInstance]);
    const pause = useCallback(() => { wavesurferInstance?.pause(); }, [wavesurferInstance]);
    const stop = useCallback(() => { wavesurferInstance?.stop(); }, [wavesurferInstance]);
    const togglePlay = useCallback(() => { wavesurferInstance?.playPause(); }, [wavesurferInstance]);
    const seekToTime = useCallback((time) => {
        if (wavesurferInstance && duration > 0) {
            wavesurferInstance.setTime(Math.max(0, Math.min(time, duration)));
        }
    }, [wavesurferInstance, duration]);
    const value = { 
        isPlaying, isRecording, setIsRecording, currentTime, bpm, 
        setPlaybackSpeed, play, pause, stop, togglePlay, seekToTime
    };
    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};