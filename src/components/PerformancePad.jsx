import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import './PerformancePad.css';

const PerformancePad = ({ beatData, beatNum, isSelected, isActive, isDisabled, onMouseDown, onMouseUp }) => {
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (isActive) classes += ' active';
        if (isDisabled) classes += ' disabled';
        if (beatData?.poseData) classes += ' has-data';
        return classes;
    };

    return (
        <button 
            className={getPadClasses()} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp} // Stop playing if mouse leaves while held down
            disabled={isDisabled}
        >
            {beatData?.poseData ? (
                <PoseThumbnail poseData={beatData.poseData} />
            ) : (
                <span className="pad-number">{beatNum}</span>
            )}
        </button>
    );
};

export default PerformancePad;