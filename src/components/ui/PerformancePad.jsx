// src/components/ui/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
// We no longer need to import useUIState here.

const PerformancePad = ({ padIndex, beatNum, isPulsing, onMouseDown, activePadIndex }) => {

    // THE FIX: The component now determines its state from the prop passed by its parent.
    const isSelected = activePadIndex === padIndex;

    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected, // This class will now be applied correctly.
    });
    
    // The raw event handler for logging remains.
    const handleRawMouseDown = (e) => {
        console.log(`%c[PerformancePad] RAW MOUSE DOWN on Pad ${beatNum} (Index: ${padIndex})`, 'color: yellow;');
        if (onMouseDown) {
            onMouseDown(e);
        }
    };

    return (
        <button 
            className={padClasses} 
            onMouseDown={handleRawMouseDown}
        >
            {beatNum}
        </button>
    );
};

export default PerformancePad;