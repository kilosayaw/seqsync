import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMedia } from './MediaContext';
import { useSequence } from './SequenceContext';
import { useUIState } from './UIStateContext';
import { useMotion } from './MotionContext';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentBeat, setCurrentBeat] = useState(0);

    const { wavesurferRef, firstBeatOffset, duration } = useMedia();
    const { totalBars, updateBeatData } = useSequence();
    const { selectedBar, setSelectedBar } = useUIState();
    const { livePoseData } = useMotion();

    const globalStepRef = useRef(0);
    const livePoseDataRef = useRef(livePoseData);
    useEffect(() => { livePoseDataRef.current = livePoseData; });

    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const onTimeUpdate = (currentTime) => {
            const stepDuration = (60 / bpm) / 4;
            if (stepDuration <= 0) return;
            const relativeTime = Math.max(0, currentTime - firstBeatOffset);
            const currentStep = Math.floor(relativeTime / stepDuration);
            
            if (currentStep !== globalStepRef.current) {
                globalStepRef.current = currentStep;
                const newBar = Math.floor(currentStep / 16) + 1;
                const newBeatInBar = currentStep % 16;
                
                if (newBar <= totalBars) {
                    if (newBar !== selectedBar) setSelectedBar(newBar);
                    setCurrentBeat(newBeatInBar);
                }
            }
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onFinish = () => {
            setIsPlaying(false);
            setCurrentBeat(0);
        };

        ws.on('timeupdate', onTimeUpdate);
        ws.on('play', onPlay);
        ws.on('pause', onPause);
        ws.on('finish', onFinish);

        return () => {
            ws.un('timeupdate', onTimeUpdate);
            ws.un('play', onPlay);
            ws.un('pause', onPause);
            ws.un('finish', onFinish);
        };
    }, [wavesurferRef, bpm, firstBeatOffset, selectedBar, setSelectedBar, totalBars]);

    useEffect(() => {
        if (isRecording && isPlaying && livePoseDataRef.current) {
            updateBeatData(globalStepRef.current, { poseData: { keypoints: livePoseDataRef.current.keypoints } });
        }
    }, [isRecording, isPlaying, globalStepRef.current]);

    const seekToGlobalStep = (step) => {
        const ws = wavesurferRef.current;
        if (!ws || duration <= 0) return;
        
        const stepDuration = (60 / bpm) / 4;
        const targetTime = firstBeatOffset + (step * stepDuration);
        ws.seekTo(targetTime / duration);
        
        globalStepRef.current = step;
        const newBar = Math.floor(step / 16) + 1;
        const newBeatInBar = step % 16;
        setSelectedBar(newBar);
        setCurrentBeat(newBeatInBar);
    };
    
    const auditionSlice = (seekTime) => {
        const ws = wavesurferRef.current;
        if (!ws) return;
        ws.play(seekTime);
        setTimeout(() => { if (ws && !isPlaying) ws.pause(); }, 500);
    };

    const togglePlay = () => {
        const ws = wavesurferRef.current;
        if (ws) ws.playPause();
    };
    
    const toggleRecording = () => {
        const newRecordingState = !isRecording;
        setIsRecording(newRecordingState);
        if (newRecordingState && wavesurferRef.current && !wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.play();
        }
    };
    
    const value = { isPlaying, isRecording, bpm, currentBeat, setBpm, togglePlay, toggleRecording, seekToGlobalStep, auditionSlice };
    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};