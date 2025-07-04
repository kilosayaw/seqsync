// src/components/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
import './PerformancePad.css';

// We will add the PoseThumbnail component later
// import PoseThumbnail from './PoseThumbnail'; 

const PerformancePad = ({ beatData, beatNum, isActive, onMouseDown, onMouseUp }) => {
    
    const padClasses = classNames('performance-pad', {
        'active': isActive,
        'has-data': beatData?.notation?.LF || beatData?.notation?.RF // Check if any notation exists
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* {beatData?.poseData ? (
                <PoseThumbnail poseData={beatData.poseData} />
            ) : ( */}
                <span className="pad-number">{beatNum}</span>
            {/* )} */}
        </button>
    );
};

export default PerformancePad;