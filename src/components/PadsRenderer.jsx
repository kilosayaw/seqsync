// src/components/PadsRenderer.jsx
import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePadMapping } from '../hooks/usePadMapping';
import './PadsRenderer.css'; // Assuming this file exists from the hard reset

const PadsRenderer = ({ side }) => {
    const { selectedBar, selectedBeat, setSelectedBeat } = useUIState();
    const { songData } = useSequence();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();

    // FIX: Calculate the offset to get the correct 8 pads for the right deck.
    const padOffset = side === 'left' ? 0 : 8;

    return (
        <div className="pads-grid">
            {/* FIX: Render exactly 8 pads */}
            {Array.from({ length: 8 }, (_, i) => {
                const localPadIndex = i; // 0-7
                const globalPadIndex = padOffset + localPadIndex; // 0-7 for left, 8-15 for right
                const globalBeatIndex = ((selectedBar - 1) * 16) + globalPadIndex;
                
                return (
                    <PerformancePad
                        key={`beat-${side}-${i}`}
                        beatNum={globalPadIndex + 1}
                        beatData={songData[globalBeatIndex]}
                        isSelected={selectedBeat === globalPadIndex}
                        isActive={activePadIndex === globalPadIndex} 
                        onMouseDown={() => handlePadDown(globalPadIndex)}
                        onMouseUp={() => handlePadUp(globalPadIndex)}
                    />
                )
            })}
        </div>
    );
};

export default PadsRenderer;