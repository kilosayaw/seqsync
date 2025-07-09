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
        if (!isEditing || !activePad || isFootMode || activeDirection === 'l_r') return;

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
        if (!isEditing || !activePad || activeDirection !== 'l_r') {
            if (activeDirection !== 'l_r' && isEditing) showNotification('Activate L/R to edit rotation.');
            return;
        }
        updateJointData(activePad, activeJointId, { rotation: finalAngle });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);
    
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || !activePad || activeDirection === 'l_r') {
            if (activeDirection === 'l_r' && isEditing) showNotification('Activate UP/DOWN or FWD/BWD to edit position.');
            return;
        }
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);

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