import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import './PerformancePad.css';

const PerformancePad = ({ beatData, beatNum, isSelected, onClick }) => {
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (beatData?.poseData) classes += ' has-data';
        return classes;
    };

    return (
        <button className={getPadClasses()} onClick={onClick}>
            {beatData?.poseData ? (
                <PoseThumbnail poseData={beatData.poseData} />
            ) : (
                <span className="pad-number">{beatNum}</span>
            )}
        </button>
    );
};

export default PerformancePad;