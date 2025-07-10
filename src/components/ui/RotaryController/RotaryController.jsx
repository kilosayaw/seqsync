// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback, useRef } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { activePad, selectedJoints, showNotification, activeDirection, movementFaderValue } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isEditing = selectedJoints.length > 0;
    const activeJointId = isEditing ? selectedJoints[0] : (side === 'left' ? 'LF' : 'RF');
    const isFootMode = activeJointId.endsWith('F');
    

    const defaultGrounding = `${side.charAt(0).toUpperCase()}F123T12345`;
    // DEFINITIVE: This logic ensures we have valid data whether a pad is selected or not.
    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) 
        || (isFootMode ? { grounding: defaultGrounding, rotation: 0, position: [0,0,0] } : { rotation: 0, position: [0,0,0] });
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = getPointsFromNotation(sourceData.grounding);
    
    const positionRef = useRef(initialPosition);
    positionRef.current = initialPosition;

    const handleDragMove = useCallback((delta) => {
        if (!isEditing || !activePad || isFootMode) return;

        // Map fader value (0-1) to our movement range (1-10 inches)
        // We'll use a normalized value for now. 1 inch = 0.1, 10 inches = 1.0
        const SENSITIVITY_MIN = 0.005; // Represents 1 inch of movement
        const SENSITIVITY_MAX = 0.05;  // Represents 10 inches of movement
        const faderSensitivity = SENSITIVITY_MIN + (movementFaderValue * (SENSITIVITY_MAX - SENSITIVITY_MIN));
        
        const dragAmount = delta * faderSensitivity;
        const newPos = [...positionRef.current];

        if (activeDirection === 'l_r') {
            newPos[0] = Math.max(-1, Math.min(1, newPos[0] + dragAmount)); // X-axis
        } else if (activeDirection === 'up_down') {
            newPos[1] = Math.max(-1, Math.min(1, newPos[1] - dragAmount)); // Y-axis
        } else if (activeDirection === 'fwd_bwd') {
            newPos[2] = Math.max(-1, Math.min(1, newPos[2] + dragAmount)); // Z-axis
        }
        
        updateJointData(activePad, activeJointId, { position: newPos });

    }, [activePad, isEditing, isFootMode, activeJointId, activeDirection, movementFaderValue, updateJointData]);

    const handleDragEnd = useCallback((finalAngle) => {
        // This is now ONLY for legacy foot rotation. Position is handled live in handleDragMove.
        if (!isEditing || !activePad || !isFootMode) return;
        updateJointData(activePad, activeJointId, { rotation: finalAngle });
    }, [activePad, isEditing, isFootMode, activeJointId, updateJointData]);
    
    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd, handleDragMove);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode) return;
        
        // Editing is now possible as long as a pad is active.
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
        if (isFootMode || !isEditing) return null;
        
        return (
            <XYZGrid 
                position={initialPosition} 
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