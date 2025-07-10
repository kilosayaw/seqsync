import React, { useCallback, useState, useEffect } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    // ... (State and handler logic remains the same) ...
    const { activePad, selectedJoints, showNotification, activeDirection, movementFaderValue } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isEditing = selectedJoints.length > 0;
    const activeJointId = isEditing ? selectedJoints[0] : (side === 'left' ? 'LF' : 'RF');
    const isFootMode = !isEditing || selectedJoints.some(j => j.endsWith('F'));
    
    const defaultGrounding = `${side.charAt(0).toUpperCase()}F123T12345`;
    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) 
        || (isFootMode ? { grounding: defaultGrounding, rotation: 0, position: [0, 0, 0] } : { rotation: 0, position: [0, 0, 0] });
    
    const [visualAngle, setVisualAngle] = useState(sourceData.rotation || 0);

    useEffect(() => {
        if (isFootMode) {
            setVisualAngle(sourceData.rotation || 0);
        }
    }, [sourceData.rotation, isFootMode]);

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

    const handleDragMove = useCallback((delta) => {
        if (isFootMode) {
            setVisualAngle(prev => prev + delta);
        } else {
            if (activePad === null) return;
            const sensitivity = 0.001 + (movementFaderValue * 0.009);
            const displacement = delta * sensitivity;
            selectedJoints.forEach(jointId => {
                if (!jointId.endsWith('F')) {
                    const currentPos = songData[activePad]?.joints?.[jointId]?.position || [0,0,0];
                    const newPos = [...currentPos];
                    if (activeDirection === 'l_r') newPos[0] = Math.max(-1, Math.min(1, newPos[0] + displacement));
                    else if (activeDirection === 'up_down') newPos[1] = Math.max(-1, Math.min(1, newPos[1] - displacement));
                    else if (activeDirection === 'fwd_bwd') newPos[2] = Math.max(-1, Math.min(1, newPos[2] + displacement));
                    updateJointData(activePad, jointId, { position: newPos });
                }
            });
        }
    }, [isFootMode, activePad, activeDirection, movementFaderValue, selectedJoints, songData, updateJointData]);

    const handleDragEnd = useCallback(() => {
        if (activePad !== null && isFootMode) {
            selectedJoints.forEach(jointId => {
                if(jointId.endsWith('F')) {
                    updateJointData(activePad, jointId, { rotation: visualAngle });
                }
            });
        }
    }, [activePad, isFootMode, selectedJoints, updateJointData, visualAngle]);
    
    const { handleMouseDown } = useTurntableDrag(handleDragMove, handleDragEnd);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) return;
        selectedJoints.forEach(jointId => {
            if (jointId.endsWith('F')) {
                const currentGrounding = songData[activePad]?.joints?.[jointId]?.grounding;
                const newActivePoints = new Set(getPointsFromNotation(currentGrounding));
                if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
                else newActivePoints.add(shortNotation);
                const newGroundingNotation = resolveNotationFromPoints(newActivePoints, jointId.startsWith('L') ? 'left' : 'right');
                updateJointData(activePad, jointId, { grounding: newGroundingNotation });
            }
        });
    }, [isFootMode, activePad, songData, selectedJoints, updateJointData]);

    const displayAngle = isFootMode ? visualAngle : 0;

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={displayAngle}
                onHotspotClick={handleHotspotClick}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
            />
            {/* DEFINITIVE REFACTOR: The grid is now a direct sibling, allowing for z-index stacking. */}
            {!isFootMode && (
                <XYZGrid 
                    position={sourceData.position || [0,0,0]} 
                    onPositionChange={handlePositionChange}
                    zValue={sourceData.position ? sourceData.position[2] : 0}
                    onZChange={handleZChange}
                />
            )}
        </div>
    );
};
export default RotaryController;