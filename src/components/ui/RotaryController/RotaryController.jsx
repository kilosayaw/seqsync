import React, { useCallback } from 'react';
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
    const sidePrefix = side.charAt(0).toUpperCase();

    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith(sidePrefix));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;
    const isFootMode = isEditing && activeJointId && activeJointId.endsWith('F');

    const sourceData = (activePad !== null && activeJointId && songData[activePad]?.joints?.[activeJointId]) 
        || {};
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const pivotPoint = sourceData.pivotPoint;

    // DEFINITIVE: This single callback now handles BOTH rotation and position changes.
    const handleDrag = useCallback((finalAngle, delta) => {
        if (!isEditing || activePad === null || !activeJointId) return;

        // If in foot mode, update rotation.
        if (isFootMode) {
            updateJointData(activePad, activeJointId, { rotation: finalAngle });
        } 
        // If in joint mode, update position.
        else {
            const FADER_MIN = 0.001;
            const FADER_MAX = 0.02; // Corresponds to ~10 inches per half rotation
            const sensitivity = FADER_MIN + (movementFaderValue * (FADER_MAX - FADER_MIN));
            const dragAmount = delta * sensitivity;
            
            const currentPos = songData[activePad].joints[activeJointId].position || [0,0,0];
            const newPos = [...currentPos];

            if (activeDirection === 'l_r') {
                newPos[0] = Math.max(-1, Math.min(1, newPos[0] - dragAmount));
            } else if (activeDirection === 'up_down') {
                newPos[1] = Math.max(-1, Math.min(1, newPos[1] - dragAmount));
            } else if (activeDirection === 'fwd_bwd') {
                newPos[2] = Math.max(-1, Math.min(1, newPos[2] + dragAmount));
            }
            updateJointData(activePad, activeJointId, { position: newPos });
        }
    }, [activePad, activeJointId, isEditing, isFootMode, activeDirection, movementFaderValue, songData, updateJointData]);

    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDrag);
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || !activePad || !activeJointId) return;
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, updateJointData]);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) {
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

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={getPointsFromNotation(sourceData.grounding)}
                pivotPoint={pivotPoint}
                onHotspotClick={handleHotspotClick}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
            />
            <div className="editor-overlays">
                {(!isFootMode && isEditing) ? (
                    <XYZGrid 
                        position={initialPosition} 
                        onPositionChange={handlePositionChange}
                    />
                ) : (isFootMode && activePad === null) ? (
                    <div className="placeholder-text-small">
                        Select a pad to edit contact points.
                    </div>
                ) : null}
            </div>
        </div>
    );
};
export default RotaryController;