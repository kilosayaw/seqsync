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
    const { activePad, selectedJoints, showNotification, activeDirection } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isEditing = selectedJoints.length > 0;
    const activeJointId = isEditing ? selectedJoints[0] : (side === 'left' ? 'LF' : 'RF');
    const isFootMode = activeJointId.endsWith('F');

    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) || {};
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    // DEFINITIVE FIX: Declared activePoints at the top level so it's always in scope.
    const activePoints = isFootMode ? getPointsFromNotation(sourceData.grounding) : new Set();
    
    const positionRef = useRef(initialPosition);
    positionRef.current = initialPosition;

    const handleDragMove = useCallback((delta) => {
        if (!isEditing || activePad === null || isFootMode || activeDirection === 'l_r') return;

        const SENSITIVITY = 0.01;
        const newPos = [...positionRef.current];
        const dragAmount = delta * SENSITIVITY;

        if (activeDirection === 'up_down') {
            newPos[1] = Math.max(-1, Math.min(1, newPos[1] - dragAmount));
        } else if (activeDirection === 'fwd_bwd') {
            newPos[2] = Math.max(-1, Math.min(1, newPos[2] + dragAmount));
        }
        updateJointData(activePad, activeJointId, { position: newPos });
    }, [activePad, isEditing, isFootMode, activeJointId, activeDirection, updateJointData]);

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || activePad === null) return;
        
        if (activeDirection === 'l_r') {
            updateJointData(activePad, activeJointId, { rotation: finalAngle });
        }
    }, [activePad, isEditing, activeJointId, activeDirection, updateJointData]);
    
    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd, handleDragMove);
    
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || activePad === null || activeDirection === 'l_r') {
            if (activeDirection === 'l_r') showNotification('Activate UP/DOWN or FWD/BWD to edit position.');
            return;
        }
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || !isEditing || activePad === null) {
            showNotification("Select a foot and a pad to edit contact points.");
            return;
        }
        const currentPoints = getPointsFromNotation(songData[activePad]?.joints?.[activeJointId]?.grounding);
        const newActivePoints = new Set(currentPoints);
        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, isEditing, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    const CenterControl = () => {
        if (!isEditing) return null;
        if (isFootMode) return null; 
        
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
                activePoints={activePoints} // This prop is now correctly defined
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
            />
            <div className="editor-overlays">
                <CenterControl />
            </div>
        </div>
    );
};

export default RotaryController;