import React, { useCallback, useEffect } from 'react';
import { useSequence } from '../../../context/SequenceContext';
import { useUIState } from '../../../context/UIStateContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId, isEditing, activeJointId }) => {
    const { activePad, jointEditMode, showNotification } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isFootMode = isEditing && activeJointId && activeJointId.endsWith('F');

    const sourceData = (activePad !== null && activeJointId && songData[activePad]?.joints?.[activeJointId]) || {};
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const pivotPointId = sourceData.pivotPoint;

    // DEFINITIVE FIX: This callback will now be triggered on every frame of the drag.
    const handleDrag = useCallback((newAngle) => {
        if (!isEditing || activePad === null || !activeJointId) return;
        
        // In foot mode, we might want to clamp the rotation, but for now, we pass it through.
        updateJointData(activePad, activeJointId, { rotation: newAngle });

    }, [activePad, activeJointId, isEditing, updateJointData]);

    // DEFINITIVE FIX: The hook's second argument is a continuous "onDrag" callback.
    const { angle, handleMouseDown, setAngle } = useTurntableDrag(initialAngle, handleDrag);
    
    // This effect ensures that when we select a new pad, the turntable visually
    // snaps to the correct starting angle of the new data.
    useEffect(() => {
        setAngle(initialAngle);
    }, [initialAngle, setAngle, activePad, activeJointId]);
    
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || activePad === null || !activeJointId) return;
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, updateJointData]);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) {
            showNotification("Select a pad to edit contact points.");
            return;
        }
        const currentGrounding = songData[activePad]?.joints?.[activeJointId]?.grounding || '';
        const currentPoints = getPointsFromNotation(currentGrounding);
        const newActivePoints = new Set(currentPoints);

        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={getPointsFromNotation(sourceData.grounding)}
                pivotPoint={pivotPointId}
                onHotspotClick={handleHotspotClick}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
            />
            <div className="editor-overlays">
                {(!isFootMode && isEditing && jointEditMode === 'position') && (
                    <XYZGrid 
                        position={initialPosition} 
                        onPositionChange={handlePositionChange}
                    />
                )}
            </div>
        </div>
    );
};
export default React.memo(RotaryController);