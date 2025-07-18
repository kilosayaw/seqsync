import { useCallback } from 'react';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useUIState } from '../context/UIStateContext.jsx';
import { useSequence } from '../context/SequenceContext.jsx';
import { useMedia } from '../context/MediaContext.jsx'; // DEFINITIVE FIX: This line was missing
import { seekToPad } from '../utils/notationUtils.js';

// This hook is the central controller for all user-driven navigation.
export const usePlaybackSync = () => {
    const { isPlaying, togglePlay, handleRecord, duration } = usePlayback();
    const { activePad, setActivePad, selectedBar, setSelectedBar } = useUIState();
    const { totalBars, STEPS_PER_BAR, barStartTimes } = useSequence();
    const { mediaType, videoRef, wavesurferInstance, detectedBpm } = useMedia(); // Now correctly imported

    // This is the MASTER function. All user actions (clicks, keys, arrows) will call this.
    const handleSeekToPad = useCallback((newPadIndex) => {
        if (isPlaying) return; // Do not allow seeking while playing.
        
        const totalSteps = totalBars * STEPS_PER_BAR;
        if (totalSteps === 0) return; // Don't do anything if no sequence is loaded

        // 1. Update the application's state immediately.
        const wrappedPadIndex = (newPadIndex + totalSteps) % totalSteps;
        setActivePad(wrappedPadIndex);

        const newBar = Math.floor(wrappedPadIndex / STEPS_PER_BAR) + 1;
        if (selectedBar !== newBar) {
            setSelectedBar(newBar);
        }

        // 2. Seek the actual media player.
        const player = mediaType === 'video' ? videoRef.current : wavesurferInstance;
        if (player) {
            seekToPad({
                player,
                mediaType,
                duration,
                bpm: detectedBpm,
                padIndex: wrappedPadIndex,
                barStartTimes,
            });
        }
    }, [
        isPlaying, totalBars, STEPS_PER_BAR, barStartTimes, selectedBar, activePad,
        setActivePad, setSelectedBar, mediaType, videoRef, wavesurferInstance, duration, detectedBpm
    ]);

    // Handler for beat step arrows (< and >)
    const handleBeatStep = useCallback((direction) => {
        handleSeekToPad(activePad + direction);
    }, [activePad, handleSeekToPad]);

    // Handler for bar jump arrows (<< and >>)
    const handleBarJump = useCallback((direction) => {
        const newBar = selectedBar + direction;
        if (newBar >= 1 && newBar <= totalBars) {
            const newPadIndex = (newBar - 1) * STEPS_PER_BAR;
            handleSeekToPad(newPadIndex);
        }
    }, [selectedBar, totalBars, handleSeekToPad]);
    
    return { 
        handleBeatStep, 
        handleBarJump, 
        handlePadClick: handleSeekToPad,
        togglePlay, 
        handleRecord 
    };
};