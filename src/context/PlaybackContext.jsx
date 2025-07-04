import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext'; // CORRECTED
import { useUIState } from './UIStateContext';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const { wavesurferInstance, duration } = useMedia(); // CORRECTED
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    const handleAudioProcess = useCallback((time) => { setCurrentTime(time); }, []);

    useEffect(() => {
        const ws = wavesurferInstance;
        if (!ws) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onFinish = () => { setIsPlaying(false); setCurrentTime(0); };
        const onSeek = (time) => setCurrentTime(ws.getCurrentTime());
        ws.on('play', onPlay);
        ws.on('pause', onPause);
        ws.on('finish', onFinish);
        ws.on('audioprocess', handleAudioProcess);
        ws.on('seeking', onSeek);
        return () => {
            ws.un('play', onPlay); ws.un('pause', onPause); ws.un('finish', onFinish);
            ws.un('audioprocess', handleAudioProcess); ws.un('seeking', onSeek);
        };
    }, [wavesurferInstance, handleAudioProcess]);
    
    const play = useCallback(() => { wavesurferInstance?.play(); }, [wavesurferInstance]);
    const pause = useCallback(() => { wavesurferInstance?.pause(); }, [wavesurferInstance]);
    const togglePlay = useCallback(() => { wavesurferInstance?.playPause(); }, [wavesurferInstance]);
    
    const seekToTime = useCallback((time) => {
        if (wavesurferInstance && duration > 0) {
            wavesurferInstance.setTime(Math.max(0, Math.min(time, duration)));
        }
    }, [wavesurferInstance, duration]);
    
    const value = { isPlaying, isRecording, setIsRecording, currentTime, play, pause, togglePlay, seekToTime };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};