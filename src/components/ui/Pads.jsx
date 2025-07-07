// src/components/ui/Pads.jsx

import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import './Pads.css';

// MODIFIED: Now receives onPadClick as a prop
const Pads = ({ side, onPadClick }) => {
    const { selectedBar } = useUIState();
    const { STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    return (
        <div className="pads-container">
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const displayNumber = padIndexInBar + 1;
                const isPulsing = isPlaying && selectedBar === currentBar && padIndexInBar === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        padIndex={padIndexInBar} 
                        beatNum={displayNumber}
                        isPulsing={isPulsing}
                        // MODIFIED: Calls the function passed down from the parent (RightDeck)
                        onMouseDown={() => onPadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};

export default Pads;