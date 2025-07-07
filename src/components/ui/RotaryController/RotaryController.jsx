// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
// ... other imports
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useDampedTurntableDrag } from '../../../hooks/useDampedTurntableDrag';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    // Get the new showNotification function from context
    const { editMode, activePad, selectedBar, showNotification } = useUIState(); 
    // ... other hooks are the same
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    // ... a large portion of this file is unchanged ...
    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;
    const currentBeatData = songData[globalIndex] || { joints: { [jointId]: { grounding: `${jointId}0`, angle: 0 } } };
    const initialAngle = currentBeatData.joints[jointId]?.angle || 0;
    const currentGrounding = currentBeatData.joints[jointId]?.grounding || `${jointId}0`;
    const activePoints = getPointsFromNotation(currentGrounding);
    const isEditing = editMode === side || editMode === 'both';
    const handleDragEnd = useCallback((finalAngle) => { /* ... */ }, [/* ... */]);
    const { angle, handleMouseDown } = useDampedTurntableDrag(initialAngle, handleDragEnd);


    const handleHotspotClick = (shortNotation) => {
        if (!isEditing) return;

        // DEFINITIVE FIX: Show a user-facing notification instead of a console log.
        if (activePad === null) {
            showNotification("Please select a pad (1-16) to edit.");
            return;
        }
        
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        const newActivePoints = new Set(activePoints);

        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(indexToUpdate, jointId, { grounding: newGroundingNotation });
    };

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
        </div>
    );
};
export default RotaryController;