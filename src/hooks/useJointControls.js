// src/hooks/useJointControls.js
import { useCallback } from 'react';
import { useSequence } from '../context/SequenceContext';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from './usePadMapping';

export const useJointControls = (side) => {
    const { updateJointData, songData } = useSequence();
    const { selectedBar, selectedBeat } = useUIState();
    const { isPlaying } = usePlayback();
    const { activeGlobalIndex } = usePadMapping();

    const getTargetIndex = useCallback(() => {
        return isPlaying ? activeGlobalIndex : (selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1);
    }, [isPlaying, activeGlobalIndex, selectedBar, selectedBeat]);

    const incrementRotation = useCallback((amount) => {
        const targetIndex = getTargetIndex();
        if (targetIndex === -1) return;
        
        const jointId = side.charAt(0).toUpperCase() + 'F';
        const currentAngle = songData[targetIndex]?.joints[jointId]?.angle || 0;
        updateJointData(targetIndex, jointId, { angle: currentAngle + amount });
    }, [getTargetIndex, side, songData, updateJointData]);

    // ... we will add more functions here like setRotationState, etc.

    return { incrementRotation };
};