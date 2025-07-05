import { useMemo } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';

export const usePadMapping = () => {
    const { selectedBar, noteDivision } = useUIState();
    const { currentBeat, isPlaying } = usePlayback();
    const { totalBars } = useSequence();

    const pads = useMemo(() => {
        const numPads = 16;
        const step = numPads / noteDivision; // How many pads to skip
        
        return Array.from({ length: numPads }, (_, i) => {
            const isVisible = (i % step) === 0;
            const globalStepIndex = ((selectedBar - 1) * 16) + i;
            
            return {
                index: i,
                beat: i, // Beat within the bar (0-15)
                globalStepIndex,
                isVisible
            };
        });
    }, [selectedBar, noteDivision]);

    // This logic determines which pad should light up during playback
    const activePadIndex = useMemo(() => {
        if (!isPlaying) return -1;
        return currentBeat;
    }, [isPlaying, currentBeat]);

    return { pads, activePadIndex };
};