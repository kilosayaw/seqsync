// src/components/ui/PerformancePad.jsx

import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './PerformancePad.css';

const PerformancePad = ({ padIndex, beatNum, isPulsing, onMouseDown }) => {
    // Get the global activePad state from the context.
    const { activePad } = useUIState();

    // This pad determines FOR ITSELF if it is the selected one.
    const isSelected = activePad === padIndex;

    // Use the classnames library to conditionally apply CSS classes.
    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,   // For the live playback indicator
        'selected': isSelected, // For the user-selected editing indicator
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={onMouseDown}
        >
            {/* The number displayed on the pad */}
            {beatNum}
        </button>
    );
};

export default PerformancePad;