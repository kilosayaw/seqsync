import { useMemo } from 'react';
import { useSequence } from '../context/SequenceContext.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';

// This is a PURE CALCULATOR hook. It does not contain JSX.
export const usePadMapping = (selectedBar) => {
    const { sequence } = useSequence();
    // Getting the necessary values from the correct context
    const { activeBeat, currentBar } = usePlayback();

    const playheadPadIndex = useMemo(() => {
        // Only calculate a playhead if it's on the bar we are currently viewing
        if (currentBar !== selectedBar) {
            return null;
        }

        const cycle = sequence.timeSignature.beats * sequence.timeSignature.subdivision;
        const beatInBar = activeBeat - 1;
        const padsPerBeat = cycle / sequence.timeSignature.beats;
        const index = Math.floor(beatInBar * padsPerBeat);

        if (index >= 0 && index < cycle) {
            return index;
        }
        return null;

    }, [activeBeat, currentBar, selectedBar, sequence]);

    // This hook only returns the calculated index.
    return { playheadPadIndex };
};