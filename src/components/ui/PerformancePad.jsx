import React from 'react';
import classNames from 'classnames';
import './PerformancePad.css';

const PerformancePad = ({ beatData, beatNum, isActive, onMouseDown, onMouseUp }) => {
    
    const padClasses = classNames('performance-pad', {
        'active': isActive,
        'has-data': false // Placeholder for now
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {beatNum}
        </button>
    );
};

export default PerformancePad;