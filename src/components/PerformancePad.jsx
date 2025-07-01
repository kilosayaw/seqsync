import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import './PerformancePad.css';

const PerformancePad = ({ beatData, beatNum, isSelected, isActive, isDisabled, onClick }) => {
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (isActive) classes += ' active'; // Add active class for playhead
        if (isDisabled) classes += ' disabled'; // Add disabled class
        if (beatData?.poseData) classes += ' has-data';
        return classes;
    };

    return (
        <button className={getPadClasses()} onClick={onClick} disabled={isDisabled}>
            {beatData?.poseData ? (
                <PoseThumbnail poseData={beatData.poseData} />
            ) : (
                <span className="pad-number">{beatNum}</span>
            )}
        </button>
    );
};

export default PerformancePad;