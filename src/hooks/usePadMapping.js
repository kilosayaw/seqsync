import { useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';

export const usePadMapping = () => {
    const { noteDivision, padPlayMode, selectedBar } = useUIState();
    const { currentTime, bpm, seekToTime, isPlaying, play, pause } = usePlayback();
    const { barStartTimes } = useSequence();

    const beatsPerSecond = bpm / 60;
    const totalSixteenths = isPlaying ? Math.floor(currentTime * beatsPerSecond * 4) : -1;
    const currentBarIndex = totalSixteenths !== -1 ? Math.floor(totalSixteenths / 16) : -1;
    let activePadIndex = -1;
    if (totalSixteenths !== -1) {
        if (noteDivision === 16) activePadIndex = totalSixteenths % 16;
        else if (noteDivision === 8) {
            const barWithinCycle = currentBarIndex % 2;
            activePadIndex = (barWithinCycle * 8) + Math.floor((totalSixteenths % 16) / 2);
        } else if (noteDivision === 4) {
            const barWithinCycle = currentBarIndex % 4;
            activePadIndex = (barWithinCycle * 4) + Math.floor((totalSixteenths % 16) / 4);
        }
    }

    const seekToPad = useCallback((padIndex, bar) => {
        if (padIndex === null || bar === null || !barStartTimes.length) return;
        const barStartTime = barStartTimes[bar - 1] || 0;
        const stepMultiplier = 16 / noteDivision;
        const padPositionInDivision = padIndex % noteDivision;
        const padOffsetInSixteenths = padPositionInDivision * stepMultiplier;
        const padOffsetTime = padOffsetInSixteenths / (beatsPerSecond * 4);
        const finalTime = barStartTime + padOffsetTime;
        seekToTime(finalTime);
        return finalTime;
    }, [noteDivision, beatsPerSecond, seekToTime, barStartTimes]);
    
    const handlePadDown = useCallback((padIndex) => {
        console.log(`[PadMapping] Pad Down: ${padIndex + 1}, Mode: ${padPlayMode}`);
        seekToPad(padIndex, selectedBar); // It now correctly calls the internal seekToPad

        if (padPlayMode === 'TRIGGER') {
            if (!isPlaying) {
                play();
            }
        } else if (padPlayMode === 'GATE') {
            play();
        }
    }, [seekToPad, selectedBar, padPlayMode, isPlaying, play]);

    const handlePadUp = useCallback(() => {
        if (padPlayMode === 'GATE') {
            console.log(`[PadMapping] Pad Up: Pausing for GATE mode.`);
            pause();
        }
    }, [padPlayMode, pause]);


    return { 
        activePadIndex, 
        handlePadDown, 
        handlePadUp,
        seekToPad // <<< THIS WAS MISSING AND IS NOW RESTORED
    };
};