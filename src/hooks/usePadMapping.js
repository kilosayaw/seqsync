import { useCallback, useMemo } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { useMedia } from '../context/MediaContext'; // CORRECTED

export const usePadMapping = () => {
    const { noteDivision, padPlayMode, setActivePad, selectedBar } = useUIState();
    const { currentTime, isPlaying, play, pause, seekToTime } = usePlayback();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const { detectedBpm } = useMedia(); // CORRECTED

    const beatsPerSecond = detectedBpm ? detectedBpm / 60 : 0;
    
    const activePadIndex = useMemo(() => {
        if (!isPlaying || beatsPerSecond <= 0) return -1;
        const totalSixteenths = Math.floor(currentTime * beatsPerSecond * 4);
        return totalSixteenths % STEPS_PER_BAR;
    }, [isPlaying, currentTime, beatsPerSecond, STEPS_PER_BAR]);

    const seekToPad = useCallback((padIndex, bar) => {
        if (padIndex === null || bar === null || !barStartTimes || barStartTimes.length === 0 || !detectedBpm) return;
        const barStartTime = barStartTimes[bar - 1] || 0;
        const stepMultiplier = 16 / noteDivision;
        const padPositionInDivision = padIndex % (16 / stepMultiplier);
        const padOffsetInSixteenths = padPositionInDivision * stepMultiplier;
        const padOffsetTime = beatsPerSecond > 0 ? padOffsetInSixteenths / (beatsPerSecond * 4) : 0;
        const finalTime = barStartTime + padOffsetTime;
        seekToTime(finalTime);
    }, [noteDivision, beatsPerSecond, seekToTime, barStartTimes, detectedBpm]);
    
    const handlePadDown = useCallback((padIndex, bar) => {
        setActivePad(padIndex);
        seekToPad(padIndex, bar);
        if (padPlayMode === 'TRIGGER' && !isPlaying) play();
        else if (padPlayMode === 'GATE') play();
    }, [seekToPad, padPlayMode, isPlaying, play, setActivePad]);

    const handlePadUp = useCallback(() => {
        setActivePad(null);
        if (padPlayMode === 'GATE') pause();
    }, [padPlayMode, pause, setActivePad]);

    return { activePadIndex, handlePadDown, handlePadUp };
};