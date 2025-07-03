import React from 'react';
import FootThumbnail from './FootThumbnail';
// import PoseThumbnail from './PoseThumbnail'; // Kept for future use
import './PerformancePad.css';

const PerformancePad = (props) => {
    const { 
        beatData, beatNum, isEditMode,
        isSelected, isActive, isDisabled, 
        onMouseDown, onMouseUp, onClick 
    } = props;
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (isActive) classes += ' active';
        if (isDisabled) classes += ' disabled';
        
        const hasData = beatData?.joints && Object.values(beatData.joints).some(
            joint => joint.angle !== 0 || (joint.grounding && !joint.grounding.endsWith('0'))
        );
        if (hasData) classes += ' has-data';
        
        return classes;
    };

    const renderContent = () => {
        const hasFootData = beatData?.joints?.LF?.grounding || beatData?.joints?.RF?.grounding;

        // --- UPGRADED RENDER LOGIC ---
        // Priority 1: If we are in foot edit mode, OR if there is existing foot data, show the thumbnail.
        if (isEditMode || hasFootData) {
            // Pass the beatData. FootThumbnail will handle if it's undefined.
            return <FootThumbnail beatData={beatData} />;
        }
        
        // Future Priority: if (beatData?.poseData) { ... }
        
        // Fallback: Show the beat number.
        return <span className="pad-number">{beatNum}</span>;
    };

    return (
        <button 
            className={getPadClasses()} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={onClick}
            disabled={isDisabled}
        >
            {renderContent()}
        </button>
    );
};

export default PerformancePad;