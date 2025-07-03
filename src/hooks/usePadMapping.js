import { useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { seekToPad } from '../utils/playbackUtils.js';

export const usePadMapping = () => {
    // Get all necessary state from the contexts
    const { noteDivision, padPlayMode, selectedBar, setSelectedBeat } = useUIState();
    const { wavesurfer, duration, bpm, play, pause, isPlaying, activeBeat } = usePlayback();
    const { barStartTimes } = useSequence();

    const handlePadDown = useCallback((padIndex) => {
        setSelectedBeat(padIndex);
        // Call the pure utility function with all required data
        seekToPad({ wavesurfer, duration, bpm, padIndex, bar: selectedBar, barStartTimes, noteDivision });
        
        // Corrected playback logic
        if (padPlayMode === 'GATE') {
            play();
        } else if (padPlayMode === 'TRIGGER') {
            // Only start playing if not already playing
            if (!isPlaying) {
                play();
            }
        }
    }, [setSelectedBeat, wavesurfer, duration, bpm, selectedBar, barStartTimes, noteDivision, padPlayMode, play, isPlaying]);

    const handlePadUp = useCallback(() => {
        if (padPlayMode === 'GATE') {
            pause();
        }
    }, [padPlayMode, pause]);
    
   
    const activePadIndex = activeBeat !== -1 ? activeBeat % 16 : -1;

    // --- THIS IS THE MISSING PIECE ---
    // The hook must return the functions and values it provides.
    return {
        activePadIndex,
        handlePadDown,
        handlePadUp,
    };
};