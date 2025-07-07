// src/components/ui/RotaryController/RotaryController.jsx
import React, { useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useDampedTurntableDrag } from '../../../hooks/useDampedTurntableDrag';
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
    const currentGrounding = currentBeatData.joints[jointId]?.grounding || `${jointId}0`;
    const activePoints = getPointsFromNotation(currentGrounding);
    const isEditing = editMode === side || editMode === 'both';

    // This function is now called LIVE during the drag
    const handleAngleChange = useCallback((newAngle) => {
        if (isEditing && activePad !== null) {
            const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
            updateJointData(indexToUpdate, jointId, { angle: newAngle });
        }
    }, [activePad, isEditing, jointId, selectedBar, STEPS_PER_BAR, updateJointData]);
    
    // This function is now called ONLY when the spin stops
    const handleDragEnd = useCallback((finalAngle) => {
        if (isEditing && activePad !== null) {
            console.log(`[Rotary] Drag/spin ended for ${jointId}. Final angle: ${finalAngle.toFixed(2)}`);
        }
    }, [activePad, isEditing, jointId]);

    const { angle, handleMouseDown } = useDampedTurntableDrag(initialAngle, handleAngleChange, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        if (!isEditing) return;
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