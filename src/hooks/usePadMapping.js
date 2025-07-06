// src/hooks/usePadMapping.js
import { useMemo, useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { useMedia } from '../context/MediaContext';
import { formatTime } from '../utils/notationUtils';

export const usePadMapping = () => {
    const { setActivePad, selectedBar } = useUIState();
    const { seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();

    // This is the new, centralized handler for pad presses.
    const handlePadDown = useCallback((padIndexInBar) => {
        if (!isMediaReady) {
            console.warn("[PadInteraction] Pad pressed, but no media is ready.");
            return;
        }

        // 1. Update the global state to highlight the correct pad.
        setActivePad(padIndexInBar);

        // 2. Calculate the precise time for this pad.
        const barStartTime = barStartTimes[selectedBar - 1] || 0;
        const timePerSixteenth = (60 / bpm) / 4;
        const padTimeOffset = padIndexInBar * timePerSixteenth;
        const targetTime = barStartTime + padTimeOffset;

        // 3. Log the interaction with all relevant details.
        console.log(
            `[PadInteraction] Pad ${padIndexInBar + 1} PRESSED | ` +
            `Bar: ${selectedBar} | ` +
            `Target Time: ${formatTime(targetTime)} (${targetTime.toFixed(4)}s)`
        );

        // 4. Seek the audio timeline.
        seekToTime(targetTime);

    }, [isMediaReady, setActivePad, selectedBar, barStartTimes, bpm, seekToTime, STEPS_PER_BAR]);

    // We can add a handlePadUp for future features like note-off events.
    const handlePadUp = useCallback(() => {
        // console.log("[PadInteraction] Pad RELEASED.");
    }, []);
    
    // ... (rest of the hook remains the same)

    return { 
        handlePadDown, 
        handlePadUp,
        // ... (other exports from the hook)
    };
};