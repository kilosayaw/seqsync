// src/components/ui/RotaryController/RotaryController.jsx

import React, { useCallback } from 'react'; // No longer need useEffect or useState
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useDampedTurntableDrag } from '../../../hooks/useDampedTurntableDrag';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { editMode, activePad, selectedBar } = useUIState();
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = `${side.charAt(0).toUpperCase()}F`;

    // Determine the correct data to display
    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;

    // DEFINITIVE FIX: Derive values directly from props/context on every render.
    // This eliminates state synchronization bugs.
    const currentBeatData = songData[globalIndex] || { joints: { [jointId]: { grounding: `${jointId}0`, angle: 0 } } };
    const currentAngle = currentBeatData.joints[jointId]?.angle || 0;
    const currentGrounding = currentBeatData.joints[jointId]?.grounding || `${jointId}0`;
    const activePoints = getPointsFromNotation(currentGrounding);
    
    const isEditing = editMode === side || editMode === 'both';

    // The setAngle function for the drag hook now directly updates the global state.
    const setAngleForDrag = useCallback((newAngle) => {
        if (isEditing && activePad !== null) {
            const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
            updateJointData(indexToUpdate, jointId, { angle: newAngle });
        }
    }, [activePad, isEditing, jointId, selectedBar, STEPS_PER_BAR, updateJointData]);

    const handleDragEnd = useCallback((finalAngle) => {
        // The angle is already saved during the drag, but we can log the final value.
        console.log(`[Rotary] Drag ended for ${jointId}. Final angle: ${finalAngle.toFixed(2)}`);
    }, [jointId]);

    const { handleMouseDown } = useDampedTurntableDrag(currentAngle, setAngleForDrag, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        if (!isEditing || activePad === null) return;
        
        console.log(`[RotaryController] Hotspot clicked: ${shortNotation}`); // ADDED LOG
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        
        // Use the current 'activePoints' derived directly from the global state
        const newActivePoints = new Set(activePoints);

        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        
        updateJointData(indexToUpdate, jointId, { grounding: newGroundingNotation });
    };

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={currentAngle} // Pass the angle directly from global state
                activePoints={activePoints} // Pass the points directly from global state
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown}
            />
        </div>
    );
};
export default RotaryController;