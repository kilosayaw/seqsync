// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { editMode, activePad, selectedBar, selectedJoints, showNotification } = useUIState(); 
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const activeJointId = selectedJoints[0] || (side === 'left' ? 'LF' : 'RF');
    const isFootMode = activeJointId.endsWith('F');

    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;

    const sourceData = songData[globalIndex]?.joints?.[activeJointId] || {};
    
    const initialAngle = sourceData.angle || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const activePoints = isFootMode ? getPointsFromNotation(sourceData.grounding) : new Set();
    
    const isEditing = selectedJoints.length > 0;

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || activePad === null) return;
        updateJointData(activePad, activeJointId, { rotation: finalAngle });
    }, [activePad, isEditing, activeJointId, updateJointData]);

    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || activePad === null) return;
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, updateJointData]);

    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || !isEditing || activePad === null) {
            showNotification("Select a foot and a pad to edit contact points.");
            return;
        }
        const currentPoints = getPointsFromNotation(songData[activePad]?.joints?.[activeJointId]?.grounding);
        const newActivePoints = new Set(currentPoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, isEditing, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    return (
        <div className="rotary-controller-container">
            {isFootMode ? (
                <RotarySVG
                    side={side}
                    angle={angle}
                    activePoints={activePoints}
                    onHotspotClick={handleHotspotClick}
                    isEditing={isEditing}
                    handleWheelMouseDown={handleMouseDown}
                />
            ) : (
                <XYZGrid 
                    position={initialPosition} 
                    onPositionChange={handlePositionChange}
                />
            )}
        </div>
    );
};

export default RotaryController;