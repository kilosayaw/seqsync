// src/components/ui/Pads.jsx
import React from 'react';
import PerformancePad from './PerformancePad';
import { useSequence } from '../../context/SequenceContext';
import { useMedia } from '../../context/MediaContext';
import './Pads.css';

const Pads = ({ side, onPadClick }) => {
    const { currentBar: selectedBar } = useSequence();
    const { isPlaying, currentBar, currentBeat } = useMedia();
    
    const padOffset = side === 'left' ? 0 : 8;

    return (
        <div className="pads-container">
            {Array.from({ length: 8 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const isPulsing = isPlaying && selectedBar === currentBar && (padIndexInBar + 1) === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        padIndex={padIndexInBar}
                        isPulsing={isPulsing}
                        onPadClick={() => onPadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};
export default Pads;