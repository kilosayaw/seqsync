// src/components/ui/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './PerformancePad.css';

// DEFINITIVE: Added isSelected as a direct prop for clarity
const PerformancePad = ({ padIndex, beatNum, isPulsing, isSelected, onMouseDown, onMouseUp, onMouseLeave }) => {
    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected, // Use the prop directly
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            {beatNum}
        </button>
    );
};
export default PerformancePad;