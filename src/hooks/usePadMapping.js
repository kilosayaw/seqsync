import { useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';

/**
 * The definitive "brain" for the performance pads.
 * It calculates the live playhead position and seek times based on Note Division.
 */
export const usePadMapping = () => {
    const { noteDivision } = useUIState();
    const { currentTime, bpm, seekToTime } = usePlayback();

    // Calculate the total number of 16th notes that have passed
    const beatsPerSecond = bpm / 60;
    const totalSixteenths = Math.floor(currentTime * beatsPerSecond * 4);

    let activePadIndex = -1;

    // This logic determines which pad should be lit up as the playhead
    if (noteDivision === 16) {
        // Mode 1/16: 16 pads = 1 bar. The playhead position is a simple modulo.
        activePadIndex = totalSixteenths % 16;
    } else if (noteDivision === 8) {
        // Mode 1/8: 8 pads = 1 bar.
        const currentBarInCycle = Math.floor(totalSixteenths / 16) % 2; // Is it the first or second bar of the 2-bar cycle?
        const padBlockOffset = currentBarInCycle * 8; // Offset is 0 for bar 1, 8 for bar 2
        const positionInBlock = Math.floor((totalSixteenths % 16) / 2); // Playhead moves at half speed
        activePadIndex = padBlockOffset + positionInBlock;
    } else if (noteDivision === 4) {
        // Mode 1/4: 4 pads = 1 bar.
        const currentBarInCycle = Math.floor(totalSixteenths / 16) % 4; // Which bar of the 4-bar cycle?
        const padBlockOffset = currentBarInCycle * 4; // Offset is 0, 4, 8, or 12
        const positionInBlock = Math.floor((totalSixteenths % 16) / 4); // Playhead moves at quarter speed
        activePadIndex = padBlockOffset + positionInBlock;
    }
    
    /**
     * Calculates the correct seek time in seconds when a pad is clicked,
     * respecting the current note division.
     */
    const seekToPad = useCallback((padIndex) => {
        let barToSeek = Math.floor(padIndex / noteDivision);
        let stepInBarToSeek = padIndex % noteDivision;

        // Convert from pad steps to 16th note steps
        const stepMultiplier = 16 / noteDivision;
        const totalSixteenthsToSeek = (barToSeek * 16) + (stepInBarToSeek * stepMultiplier);
        
        const time = totalSixteenthsToSeek / (beatsPerSecond * 4);
        
        seekToTime(time);
    }, [noteDivision, beatsPerSecond, seekToTime]);


    return { activePadIndex, seekToPad };
};