import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import './Pads.css';

const Pads = ({ side }) => {
    const { selectedBar, setActivePad } = useUIState();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();
    
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    const handlePadClick = (padIndexInBar) => {
        if (!isMediaReady) return;
        // DEBUGGING: Confirm the correct index is being set.
        console.log(`[Pads-${side}] Pad clicked. Calling setActivePad with:`, padIndexInBar);
        setActivePad(padIndexInBar);

        const barStartTime = barStartTimes[selectedBar - 1] || 0;
        const timePerSixteenth = (60 / bpm) / 4;
        const padTimeOffset = padIndexInBar * timePerSixteenth;
        const targetTime = barStartTime + padTimeOffset;
        seekToTime(targetTime);
    };

    return (
        <div className="pads-container">
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const displayNumber = padIndexInBar + 1;
                
                // Determine if this pad is the one currently being hit by the live playhead.
                const isPulsing = isPlaying && selectedBar === currentBar && padIndexInBar === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        // Pass the pad's own unique index (0-15)
                        padIndex={padIndexInBar} 
                        beatNum={displayNumber}
                        isPulsing={isPulsing}
                        onMouseDown={() => handlePadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};

export default Pads;