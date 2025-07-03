import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import FootThumbnail from './FootThumbnail';
import './PerformancePad.css';

const PerformancePad = (props) => {
    const { 
        mode, beatData, beatNum, presetData,
        isEditMode, // Receive the edit mode state
        isSelected, isActive, isDisabled, 
        onMouseDown, onMouseUp, onClick 
    } = props;
    
    const getPadClasses = () => {
        let classes = 'performance-pad';
        if (isSelected) classes += ' selected';
        if (isActive) classes += ' active';
        if (isDisabled) classes += ' disabled';
        
        const hasData = beatData?.joints && Object.values(beatData.joints).some(
            joint => joint.angle !== 0 || (joint.grounding && !joint.grounding.endsWith('0') && !joint.grounding.endsWith('123T12345'))
        );
        if (hasData) classes += ' has-data';
        
        return classes;
    };

    const renderContent = () => {
        if (mode === 'preset' && presetData) {
            return <span className="pad-preset-name">{presetData.name}</span>;
        }

        // --- UPGRADED RENDER LOGIC ---
        // If we are in edit mode, OR if there is existing foot data, show the thumbnail.
        const shouldShowFoot = isEditMode || beatData?.joints?.LF?.grounding || beatData?.joints?.RF?.grounding;

        if (shouldShowFoot) {
            // Pass the beatData, which may be undefined. The thumbnail will handle it.
            return <FootThumbnail beatData={beatData} />;
        }
        
        if (beatData?.poseData) {
            return <PoseThumbnail poseData={beatData.poseData} />;
        }
        
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