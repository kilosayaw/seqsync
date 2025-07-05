import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext'; // Import context
import './PerformancePad.css';

const PerformancePad = ({ padIndex, beatNum, isPulsing, onMouseDown }) => {
    // Get the global activePad state
    const { activePad } = useUIState();

    // The pad determines FOR ITSELF if it is selected.
    const isSelected = activePad === padIndex;

    // DEBUGGING: Log the state of this specific pad on every render.
    // console.log(`Pad ${beatNum}: isSelected=${isSelected}, isPulsing=${isPulsing}`);

    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected,
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={onMouseDown}
        >
            {beatNum}
        </button>
    );
};

export default PerformancePad;