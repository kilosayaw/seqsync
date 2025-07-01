import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import './PerformancePad.css';

// Accept the new `pad` object and `isActive` prop
const PerformancePad = ({ pad, isSelected, isActive, onClick }) => {
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (pad.poseData) classes += ' has-data';
        if (isActive) classes += ' active';
        return classes;
    };

    return (
        <button className={getPadClasses()} onClick={onClick}>
            {pad.poseData ? (
                <PoseThumbnail poseData={pad.poseData} />
            ) : (
                <span className="pad-number">{pad.displayLabel}</span>
            )}
        </button>
    );
};

export default PerformancePad;