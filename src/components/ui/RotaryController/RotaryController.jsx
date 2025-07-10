import React, { useCallback, useRef } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { activePad, selectedJoints, showNotification } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isEditing = selectedJoints.length > 0;
    const activeJointId = isEditing ? selectedJoints[0] : (side === 'left' ? 'LF' : 'RF');
    // DEFINITIVE FIX: isFootMode should only be true if no joint is selected, or if the selected joint is explicitly a foot.
    const isFootMode = !isEditing || activeJointId.endsWith('F');
    
    const defaultGrounding = `${side.charAt(0).toUpperCase()}F123T12345`;
    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) 
        || (isFootMode ? { grounding: defaultGrounding, rotation: 0, position: [0, 0, 0] } : { rotation: 0, position: [0, 0, 0] });
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = getPointsFromNotation(sourceData.grounding);
    
    // DEFINITIVE FIX: Define the missing handlePositionChange function.
    // It uses useCallback for performance, ensuring it's not recreated on every render unless its dependencies change.
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || activePad === null) return;
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, activeJointId, isEditing, updateJointData]);

    const handleDragEnd = useCallback((finalAngle) => {
        if (!activePad || !isFootMode) return;
        updateJointData(activePad, activeJointId, { rotation: finalAngle });
    }, [activePad, isFootMode, activeJointId, updateJointData]);
    
    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode) return;
        if (activePad === null) {
            showNotification("Select a pad to edit contact points.");
            return;
        }
        const currentGrounding = songData[activePad]?.joints?.[activeJointId]?.grounding;
        const currentPoints = getPointsFromNotation(currentGrounding);
        const newActivePoints = new Set(currentPoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    const CenterControl = () => {
        // The XYZGrid should render when NOT in foot mode.
        if (isFootMode) return null;
        
        return (
            <XYZGrid 
                position={initialPosition} 
                // Pass the correctly defined handler to the component.
                onPositionChange={handlePositionChange}
            />
        );
    };

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
            />
            <div className="editor-overlays">
                <CenterControl />
                {isFootMode && activePad === null && (
                    <div className="placeholder-text-small">
                        Select a pad to edit contact points.
                    </div>
                )}
            </div>
        </div>
    );
};
export default RotaryController;