// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    // DEFINITIVE: Get activeDirection for conditional logic
    const { activePad, selectedJoints, showNotification, activeDirection } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const isEditing = selectedJoints.length > 0;
    const activeJointId = isEditing ? selectedJoints[0] : (side === 'left' ? 'LF' : 'RF');
    const isFootMode = activeJointId.endsWith('F');

    const sourceData = songData[activePad]?.joints?.[activeJointId] || {};
    
    // Use 'rotation' as the primary source of truth for the angle
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = isFootMode ? getPointsFromNotation(sourceData.grounding) : new Set();

    // --- DEFINITIVE: UNIFIED CONTROL LOGIC ---
    const handleDragEnd = useCallback((finalAngle) => {
        // Only update rotation if a pad is selected, a joint is selected, AND the L/R button is active
        if (!isEditing || activePad === null || activeDirection !== 'l_r') {
            showNotification('Activate L/R to edit rotation.');
            return;
        }
        updateJointData(activePad, activeJointId, { rotation: finalAngle });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);

    const handlePositionChange = useCallback((newPosition) => {
        // Only update position if a pad and joint are selected, and direction is NOT L/R
        if (!isEditing || activePad === null || activeDirection === 'l_r') {
            showNotification('Activate UP/DOWN or FWD/BWD to edit position.');
            return;
        }
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, activeDirection, showNotification, updateJointData]);

    // The turntable drag hook is now conditionally controlled by the callbacks above
    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);

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

    // Determine what to show in the center: XYZ Grid for position, or Foot controls for grounding.
    const centerContent = !isFootMode && isEditing ? (
        <XYZGrid 
            position={initialPosition} 
            onPositionChange={handlePositionChange}
        />
    ) : isFootMode && isEditing ? (
        <div className="foot-editor-placeholder" /> // Placeholder for future foot controls
    ) : null;

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown}
            />
            {/* The XYZGrid or other controls will overlay the turntable */}
            {centerContent}
        </div>
    );
};

export default RotaryController;