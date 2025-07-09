// src/components/ui/RotaryController/RotaryController.jsx

import React, { useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
// DEFINITIVE FIX: Import the correctly named hook from the correct file.
import { useTurntableDrag } from '../../../hooks/useTurntableDrag'; 
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { editMode, activePad, selectedBar, showNotification } = useUIState(); 
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;
    const currentBeatData = songData[globalIndex] || { joints: { [jointId]: { grounding: `${jointId}0`, angle: 0 } } };
    const initialAngle = currentBeatData.joints[jointId]?.angle || 0;
    const activePoints = getPointsFromNotation(currentBeatData.joints[jointId]?.grounding);
    const isEditing = editMode === side || editMode === 'both';

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || activePad === null) {
            return;
        }
        console.log(`[Rotary] Drag ended for ${jointId}. Saving final angle: ${finalAngle.toFixed(2)} to Pad ${activePad + 1}`);
        const indexToUpdate = activePad;
        updateJointData(indexToUpdate, jointId, { angle: finalAngle });
    }, [activePad, isEditing, jointId, updateJointData]);

    // This now correctly calls the hook we have in our project.
    const { angle, handleMouseDown } = useTurntableDrag(initialAngle, handleDragEnd);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isEditing) return;
        if (activePad === null) {
            showNotification("Please select a pad (1-16) to edit.");
            return;
        }
        const indexToUpdate = activePad;
        const currentPoints = getPointsFromNotation(songData[indexToUpdate]?.joints?.[jointId]?.grounding);
        const newActivePoints = new Set(currentPoints);

        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(indexToUpdate, jointId, { grounding: newGroundingNotation });
    }, [isEditing, activePad, showNotification, songData, jointId, side, updateJointData]);

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