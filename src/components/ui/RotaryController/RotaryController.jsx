import React, { useCallback, useState, useEffect } from 'react';
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
    const isFootMode = !isEditing || selectedJoints.some(j => j.endsWith('F'));
    
    const defaultGrounding = `${side.charAt(0).toUpperCase()}F123T12345`;
    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) 
        || (isFootMode ? { grounding: defaultGrounding, rotation: 0, position: [0, 0, 0] } : { rotation: 0, position: [0, 0, 0] });
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = getPointsFromNotation(sourceData.grounding);
    
    // DEFINITIVE REFACTOR: Manage visual rotation angle locally.
    const [visualAngle, setVisualAngle] = useState(initialAngle);

    // Sync visual angle with data changes only when in foot mode
    useEffect(() => {
        if (isFootMode) {
            setVisualAngle(initialAngle);
        }
    }, [initialAngle, isFootMode]);

    // --- Handlers for XYZGrid (used when !isFootMode) ---
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || activePad === null || isFootMode) return;
        selectedJoints.forEach(jointId => {
            if (!jointId.endsWith('F')) {
                 updateJointData(activePad, jointId, { position: newPosition });
            }
        });
    }, [activePad, isEditing, selectedJoints, updateJointData, isFootMode]);

    const handleZChange = useCallback((newZ) => {
        if (!isEditing || activePad === null || isFootMode) return;
        selectedJoints.forEach(jointId => {
            if (!jointId.endsWith('F')) {
                const currentPos = songData[activePad]?.joints?.[jointId]?.position || [0,0,0];
                const newPosition = [currentPos[0], currentPos[1], newZ];
                updateJointData(activePad, jointId, { position: newPosition });
            }
        });
    }, [activePad, isEditing, songData, selectedJoints, updateJointData, isFootMode]);


    // --- Handlers for Turntable Drag (useTurntableDrag hook) ---
    const handleDragMove = useCallback((delta) => {
        if (isFootMode) {
            // Foot Mode: Update visual rotation for immediate feedback.
            setVisualAngle(prev => prev + delta);
        } else {
            // Joint Edit Mode: Use drag delta to control displacement on the active axis.
            if (activePad === null) return;

            const SENSITIVITY_BASE = 0.001;
            // movementFaderValue ranges from 0 to 1. Scale it to control sensitivity.
            const sensitivity = SENSITIVITY_BASE + (movementFaderValue * 0.009);
            const displacement = delta * sensitivity;

            selectedJoints.forEach(jointId => {
                if (!jointId.endsWith('F')) {
                    const currentPos = songData[activePad]?.joints?.[jointId]?.position || [0,0,0];
                    const newPos = [...currentPos];

                    if (activeDirection === 'l_r') {
                        newPos[0] = Math.max(-1, Math.min(1, newPos[0] + displacement));
                    } else if (activeDirection === 'up_down') {
                        newPos[1] = Math.max(-1, Math.min(1, newPos[1] - displacement)); // Invert Y for natural feel
                    } else if (activeDirection === 'fwd_bwd') {
                        newPos[2] = Math.max(-1, Math.min(1, newPos[2] + displacement));
                    }
                    
                    updateJointData(activePad, jointId, { position: newPos });
                }
            });
        }
    }, [isFootMode, activePad, activeDirection, movementFaderValue, selectedJoints, songData, updateJointData]);

    const handleDragEnd = useCallback(() => {
        // Only commit the rotation data if in Foot Mode.
        if (activePad !== null && isFootMode) {
            selectedJoints.forEach(jointId => {
                if(jointId.endsWith('F')) {
                    // Use the final visual angle to update the stored data.
                    updateJointData(activePad, jointId, { rotation: visualAngle });
                }
            });
        }
    }, [activePad, isFootMode, selectedJoints, updateJointData, visualAngle]);
    
    const { handleMouseDown } = useTurntableDrag(handleDragMove, handleDragEnd);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) {
            showNotification("Select a pad and a Foot (LF/RF) to edit contact points.");
            return;
        }
        selectedJoints.forEach(jointId => {
            if (jointId.endsWith('F')) {
                const currentGrounding = songData[activePad]?.joints?.[jointId]?.grounding;
                const currentPoints = getPointsFromNotation(currentGrounding);
                const newActivePoints = new Set(currentPoints);
                if (newActivePoints.has(shortNotation)) {
                    newActivePoints.delete(shortNotation);
                } else {
                    newActivePoints.add(shortNotation);
                }
                const newGroundingNotation = resolveNotationFromPoints(newActivePoints, jointId.startsWith('L') ? 'left' : 'right');
                updateJointData(activePad, jointId, { grounding: newGroundingNotation });
            }
        });
    }, [isFootMode, activePad, showNotification, songData, selectedJoints, updateJointData]);

    const CenterControl = () => {
        if (isFootMode) return null;
        return (
            <XYZGrid 
                position={initialPosition} 
                onPositionChange={handlePositionChange}
                zValue={initialPosition[2]}
                onZChange={handleZChange}
            />
        );
    };

    // The visual angle applied to the SVG depends on the mode.
    const displayAngle = isFootMode ? visualAngle : 0;

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={displayAngle} // Use displayAngle here
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