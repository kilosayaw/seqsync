import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMotion } from './MotionContext';
import { useSequence } from './SequenceContext';
import { useUIState } from './UIStateContext';

const PlaybackContext = createContext(null);

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentBeat, setCurrentBeat] = useState(0); // This is the beat within a bar (0-15)
    const intervalRef = useRef(null);

    const { livePoseData } = useMotion();
    const { updateBeatData } = useSequence();
    const { selectedBar } = useUIState();

    const livePoseDataRef = useRef(livePoseData);
    useEffect(() => {
        livePoseDataRef.current = livePoseData;
    });

    useEffect(() => {
        if (!isRecording || !isPlaying) return;

        console.log(
            `[PlaybackContext] RECORD TICK | Beat: ${currentBeat + 1} | Pose Data Available: ${!!livePoseDataRef.current}`
        );

        if (livePoseDataRef.current) {
            const globalBeatIndex = ((selectedBar - 1) * 16) + currentBeat;
            const newPose = { poseData: { keypoints: livePoseDataRef.current.keypoints } };
            
            console.log(`✅ [PlaybackContext] SAVING POSE to global index: ${globalBeatIndex}`);
            updateBeatData(globalBeatIndex, newPose);
        }
    }, [isRecording, isPlaying, currentBeat, selectedBar, updateBeatData]);
    
    useEffect(() => {
        if (isPlaying) {
            const stepInterval = (60 / bpm) * 1000 / 4;
            intervalRef.current = setInterval(() => {
                // This logic automatically wraps to the next bar in the UI, but the playhead is always 0-15
                setCurrentBeat(prev => (prev + 1) % 16);
            }, stepInterval);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, bpm]);

    const stopAll = () => {
        console.log("[PlaybackContext] Stop All called.");
        setIsPlaying(false);
        setIsRecording(false);
    };

    const togglePlay = () => {
        console.log(`[PlaybackContext] togglePlay called. Was playing: ${isPlaying}`);
        if (isPlaying) {
            stopAll();
        } else {
            setIsPlaying(true);
            if (isRecording) setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        console.log(`[PlaybackContext] toggleRecording called. Was recording: ${isRecording}`);
        if (isRecording) {
            stopAll();
        } else {
            setIsRecording(true);
            setIsPlaying(true);
        }
    };
  
    // KEY CHANGE: Exposing setCurrentBeat allows other components to control the playhead
    const value = { 
        isPlaying, 
        isRecording, 
        bpm, 
        currentBeat, 
        setBpm, 
        togglePlay, 
        toggleRecording,
        setCurrentBeat // This is now exposed
    };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};