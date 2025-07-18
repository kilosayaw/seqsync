import { useEffect, useCallback } from 'react';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useUIState } from '../context/UIStateContext.jsx';
import { useSequence } from '../context/SequenceContext.jsx';
import { useMedia } from '../context/MediaContext.jsx';
import { seekToPad } from '../utils/notationUtils.js';

export const usePlaybackSync = () => {
    const { isPlaying, currentTime, togglePlay, handleRecord } = usePlayback();
    const { selectedBar, setSelectedBar, activePad, setActivePad } = useUIState();
    const { totalBars, STEPS_PER_BAR, barStartTimes } = useSequence();
    const { mediaType, videoRef, wavesurferInstance, duration, detectedBpm } = useMedia();

    useEffect(() => {
        if (isPlaying && barStartTimes.length > 0 && detectedBpm > 0) {
            const timePerStep = (60 / detectedBpm) / 2;
            if (timePerStep > 0) {
                const currentTotalStep = Math.floor(currentTime / timePerStep);
                const currentGlobalPad = currentTotalStep % (totalBars * STEPS_PER_BAR);
                
                if (activePad !== currentGlobalPad) {
                    setActivePad(currentGlobalPad);
                    const newBar = Math.floor(currentGlobalPad / STEPS_PER_BAR) + 1;
                    if (selectedBar !== newBar) {
                        setSelectedBar(newBar);
                    }
                }
            }
        }
    }, [currentTime, isPlaying, detectedBpm, barStartTimes, totalBars, STEPS_PER_BAR, activePad, selectedBar, setActivePad, setSelectedBar]);
    
    const handleSeek = useCallback((newPadIndex) => {
        const player = mediaType === 'video' ? videoRef.current : wavesurferInstance;
        setActivePad(newPadIndex);
        const newBar = Math.floor(newPadIndex / STEPS_PER_BAR) + 1;
        if (selectedBar !== newBar) {
            setSelectedBar(newBar);
        }
        if (player) {
            seekToPad({
                player,
                mediaType,
                duration,
                bpm: detectedBpm,
                padIndex: newPadIndex,
                barStartTimes,
            });
        }
    }, [mediaType, videoRef, wavesurferInstance, duration, detectedBpm, barStartTimes, selectedBar, setActivePad, setSelectedBar, STEPS_PER_BAR]);

    const handleBeatStep = useCallback((direction) => {
        if (isPlaying) return;
        const newPad = (activePad + direction + (totalBars * STEPS_PER_BAR)) % (totalBars * STEPS_PER_BAR);
        handleSeek(newPad);
    }, [activePad, totalBars, isPlaying, handleSeek]);

    const handleBarJump = useCallback((direction) => {
        if (isPlaying) return;
        const newBar = selectedBar + direction;
        if (newBar >= 1 && newBar <= totalBars) {
            const newPad = (newBar - 1) * STEPS_PER_BAR;
            handleSeek(newPad);
        }
    }, [selectedBar, totalBars, isPlaying, handleSeek]);
    
    return { handleBeatStep, handleBarJump, handlePadClick: handleSeek, togglePlay, handleRecord };
};