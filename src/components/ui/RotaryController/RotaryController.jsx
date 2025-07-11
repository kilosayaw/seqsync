import React, { useCallback, useRef, useEffect } from 'react';
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

    // DEFINITIVE FIX: The controller now only considers selected joints that match its side.
    // This prevents the right deck from ever editing a left-side joint.
    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith(sidePrefix));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;
    const isFootMode = isEditing && activeJointId && activeJointId.endsWith('F');

    const sourceData = (activePad !== null && activeJointId && songData[activePad]?.joints?.[activeJointId]) 
        || {};
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = getPointsFromNotation(sourceData.grounding);

    const handleDragEnd = useCallback((finalAngle) => {
        if (isFootMode && activePad !== null && activeJointId) {
            updateJointData(activePad, activeJointId, { rotation: finalAngle });
        }
    }, [activePad, isFootMode, activeJointId, updateJointData]);

    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);

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

    // ... (rest of the component is unchanged)

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
                {(!isFootMode && isEditing) ? (
                    <XYZGrid position={initialPosition} />
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