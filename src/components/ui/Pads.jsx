// src/components/ui/Pads.jsx

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
    
    // Each deck has 8 pads. The right deck's pads are offset by 8.
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    const handlePadClick = (padIndexInBar) => {
        // Don't allow seeking if audio isn't loaded or playing.
        if (!isMediaReady || isPlaying) return;

        // Set this pad as the globally active one for editing.
        setActivePad(padIndexInBar);

        // Calculate the precise time to seek to.
        const barStartTime = barStartTimes[selectedBar - 1] || 0;
        const timePerSixteenth = (60 / bpm) / 4; // Duration of a single 16th note
        const padTimeOffset = padIndexInBar * timePerSixteenth;
        const targetTime = barStartTime + padTimeOffset;
        
        seekToTime(targetTime);
    };

    return (
        <div className="pads-container">
            {/* Create 8 pads for the given side */}
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                // This is the pad's index within the bar (0-15)
                const padIndexInBar = padOffset + i;
                // This is the number displayed on the pad (1-8 for left, 9-16 for right)
                const displayNumber = padIndexInBar + 1;
                
                // Determine if this pad is the one currently being hit by the live playhead.
                const isPulsing = isPlaying && selectedBar === currentBar && padIndexInBar === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        padIndex={padIndexInBar} // Pass its own unique index (0-15)
                        beatNum={displayNumber}
                        isPulsing={isPulsing}
                        // Use onMouseDown for a more responsive feel than onClick
                        onMouseDown={() => handlePadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};

export default Pads;