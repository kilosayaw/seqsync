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
    const [currentBeat, setCurrentBeat] = useState(0);
    const intervalRef = useRef(null);

    const motion = useMotion();
    const sequence = useSequence();
    const uiState = useUIState();

    // The recording effect remains the same, but will now work due to the state fix.
    useEffect(() => {
        if (isRecording && isPlaying && motion && motion.livePoseData && sequence && uiState) {
            const globalBeatIndex = ((uiState.selectedBar - 1) * 16) + currentBeat;
            const newPose = { poseData: { keypoints: motion.livePoseData.keypoints } };
            sequence.updateBeatData(globalBeatIndex, newPose);
        }
    }, [isRecording, isPlaying, currentBeat, motion, sequence, uiState]);

    useEffect(() => {
        if (isPlaying) {
            const stepInterval = (60 / bpm) * 1000 / 4;
            intervalRef.current = setInterval(() => {
                setCurrentBeat(prev => (prev + 1) % 16);
            }, stepInterval);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, bpm]);

    // --- REWRITTEN LOGIC ---
    const stopAll = () => {
        setIsPlaying(false);
        setIsRecording(false);
        // Optional: Reset playhead to the start of the bar on stop
        // setCurrentBeat(0); 
    };

    const togglePlay = () => {
        if (isPlaying) {
            // If we are playing (and maybe recording), stop everything.
            stopAll();
        } else {
            // If we are stopped, just start playing.
            setIsPlaying(true);
            setIsRecording(false); // Ensure recording is off
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            // If we are already recording, stop everything.
            stopAll();
        } else {
            // If we are not recording, start recording (which also implies playing).
            setIsRecording(true);
            setIsPlaying(true);
        }
    };
  
    const value = { isPlaying, isRecording, bpm, currentBeat, setBpm, togglePlay, toggleRecording };

    return (
        <PlaybackContext.Provider value={value}>
            {children}
        </PlaybackContext.Provider>
    );
};