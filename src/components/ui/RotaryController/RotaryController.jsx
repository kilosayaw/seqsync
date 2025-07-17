import React, { useCallback, useEffect } from 'react';
import { useSequence } from '../../../context/SequenceContext';
import { useUIState } from '../../../context/UIStateContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
// --- REMOVED: XYZGrid is no longer a child of this component ---
import './RotaryController.css';

const RotaryController = ({ deckId, isEditing, activeJointId }) => {
    const { activePad, showNotification } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isFootMode = isEditing && activeJointId && activeJointId.endsWith('F');

    const sourceData = (activePad !== null && activeJointId && songData[activePad]?.joints?.[activeJointId]) || {};
    const initialAngle = sourceData.rotation || 0;
    const pivotPointId = sourceData.pivotPoint;

    const handleDrag = useCallback((newAngle) => {
        if (!isEditing || activePad === null || !activeJointId) return;
        updateJointData(activePad, activeJointId, { rotation: newAngle });
    }, [activePad, activeJointId, isEditing, updateJointData]);

    const { angle, handleMouseDown, setAngle } = useTurntableDrag(initialAngle, handleDrag);
    
    useEffect(() => {
        setAngle(initialAngle);
    }, [initialAngle, setAngle, activePad, activeJointId]);
    
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) return;
        const currentGrounding = songData[activePad]?.joints?.[activeJointId]?.grounding || '';
        const currentPoints = getPointsFromNotation(currentGrounding);
        const newActivePoints = new Set(currentPoints);
        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    // --- REMOVED: All logic related to position and the XYZGrid is gone. ---
    // This component is now only responsible for rotation and foot hotspots.

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
            {/* The "editor-overlays" div and XYZGrid logic has been moved to the Deck components */}
        </div>
    );
};
export default React.memo(RotaryController);