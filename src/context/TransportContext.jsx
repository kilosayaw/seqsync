import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useMedia } from './MediaContext'; // Assuming MediaContext provides video duration and BPM info

const TransportContext = createContext();

export const TransportProvider = ({ children }) => {
    const { videoRef, duration, songBPM } = useMedia();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(1);
    
    // Proactive Suggestion: Using a requestAnimationFrame loop for smoother updates than a setInterval.
    const animationFrameId = useRef(); 
    
    const BPS = songBPM / 60; // Beats Per Second

    // Imperative Play/Pause Logic
    useEffect(() => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.play().catch(error => console.error("Playback failed:", error));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, videoRef]);

    const calculateTimeDisplays = useCallback((time) => {
        setCurrentTime(time);
        const totalBeats = Math.floor(time * BPS);
        const bar = Math.floor(totalBeats / 4) + 1;
        const beat = (totalBeats % 4) + 1;
        setCurrentBar(bar);
        setCurrentBeat(beat);
    }, [BPS]);
    
    // Video event listeners to sync video state -> context state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => calculateTimeDisplays(video.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoRef, calculateTimeDisplays]);


    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const seek = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            calculateTimeDisplays(time); // Immediately update display on seek
        }
    };
    
    const value = {
        isPlaying,
        currentTime,
        duration,
        currentBar,
        currentBeat,
        togglePlay,
        seek,
    };

    return (
        <TransportContext.Provider value={value}>
            {children}
        </TransportContext.Provider>
    );
};

export const useTransport = () => useContext(TransportContext);