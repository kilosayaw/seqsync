// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback, useRef, useEffect } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext'; // DEFINITIVE FIX: Re-added missing import
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

    const sourceData = (activePad !== null && songData[activePad]?.joints?.[activeJointId]) 
        || (isFootMode ? { grounding: `${side.charAt(0).toUpperCase()}F123T12345` } : {});
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = getPointsFromNotation(sourceData.grounding);
    
    const positionRef = useRef(initialPosition);
    positionRef.current = initialPosition;

    const handleDragEnd = useCallback((finalAngle) => {
        if (isFootMode && activePad !== null) {
            updateJointData(activePad, activeJointId, { rotation: finalAngle });
        }
    }, [activePad, isFootMode, activeJointId, updateJointData]);

    const { angle, delta, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);

    useEffect(() => {
        if (delta === 0 || !isEditing || !activePad || isFootMode) return;
        
        const SENSITIVITY_MIN = 0.005;
        const SENSITIVITY_MAX = 0.05;
        const faderSensitivity = SENSITIVITY_MIN + (movementFaderValue * (SENSITIVITY_MAX - SENSITIVITY_MIN));
        const dragAmount = delta * faderSensitivity;
        
        const currentPos = songData[activePad].joints[activeJointId].position || [0,0,0];
        const newPos = [...currentPos];

        if (activeDirection === 'l_r') {
            newPos[0] = Math.max(-1, Math.min(1, newPos[0] + dragAmount));
        } else if (activeDirection === 'up_down') {
            newPos[1] = Math.max(-1, Math.min(1, newPos[1] - dragAmount));
        } else if (activeDirection === 'fwd_bwd') {
            newPos[2] = Math.max(-1, Math.min(1, newPos[2] + dragAmount));
        }

        updateJointData(activePad, activeJointId, { position: newPos });

    }, [delta, activePad, isEditing, isFootMode, activeJointId, activeDirection, movementFaderValue, songData, updateJointData]);

    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || !activePad || activeDirection === 'l_r') {
            if (activeDirection === 'l_r' && isEditing) showNotification('Activate UP/DOWN or FWD/BWD to edit position.');
            return;
        }
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);

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