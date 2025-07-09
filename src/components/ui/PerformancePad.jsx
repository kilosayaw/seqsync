// src/components/ui/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './PerformancePad.css';

const PerformancePad = ({ padIndex, beatNum, isPulsing, onMouseDown, onMouseUp, onMouseLeave }) => {
    const { activePad } = useUIState();
    // DEFINITIVE FIX: isSelected logic is now correct.
    const isSelected = activePad === padIndex;

    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected,
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