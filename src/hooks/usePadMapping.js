import { useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { seekToPad } from '../utils/playbackUtils.js';

export const usePadMapping = () => {
    const { noteDivision, padPlayMode, selectedBar, setSelectedBeat } = useUIState();
    const { wavesurfer, duration, bpm, play, pause, isPlaying, activeBeat } = usePlayback();
    const { barStartTimes } = useSequence();

    const handlePadDown = useCallback((globalPadIndex) => {
        setSelectedBeat(globalPadIndex);
        seekToPad({ wavesurfer, duration, bpm, padIndex: globalPadIndex, bar: selectedBar, barStartTimes, noteDivision });
        if (padPlayMode === 'GATE' || (padPlayMode === 'TRIGGER' && !isPlaying)) {
            play();
        }
    }, [setSelectedBeat, wavesurfer, duration, bpm, selectedBar, barStartTimes, noteDivision, padPlayMode, play, isPlaying]);

    const handlePadUp = useCallback(() => {
        if (padPlayMode === 'GATE') pause();
    }, [padPlayMode, pause]);

    return { activePadIndex: activeBeat, handlePadDown, handlePadUp };
};