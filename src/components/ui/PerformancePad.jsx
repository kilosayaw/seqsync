// src/components/ui/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';

const PerformancePad = ({ padIndex, beatNum, isPulsing, onMouseDown }) => {
    const { activePad } = useUIState();
    const isSelected = activePad === padIndex;

    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected,
    });
    
    // This is the new, raw handler.
    const handleRawMouseDown = (e) => {
        // **DIAGNOSTIC LOG 1:** This is the first thing that should appear when a pad is clicked.
        console.log(`%c[PerformancePad] RAW MOUSE DOWN on Pad ${beatNum} (Index: ${padIndex})`, 'color: yellow;');
        
        // Now, call the function that was passed down from the parent.
        if (onMouseDown) {
            onMouseDown(e);
        }
    };

    return (
        // The button now calls our new raw handler.
        <button 
            className={padClasses} 
            onMouseDown={handleRawMouseDown}
        >
            {beatNum}
        </button>
    );
};

export default PerformancePad;