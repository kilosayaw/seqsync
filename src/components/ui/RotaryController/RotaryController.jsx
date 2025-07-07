// src/components/ui/RotaryController/RotaryController.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { usePlayback } from '../../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
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

    const sourceData = songData[globalIndex]?.joints[jointId] || { grounding: `${jointId}0`, angle: 0 };
    
    // DEFINITIVE FIX 1: Component manages its own display state.
    const [displayAngle, setDisplayAngle] = useState(sourceData.angle);
    const [activePoints, setActivePoints] = useState(() => getPointsFromNotation(sourceData.grounding));

    // This effect syncs the component's state with the global context
    // ONLY when the source data changes (i.e., user selects a new pad).
    useEffect(() => {
        setDisplayAngle(sourceData.angle);
        setActivePoints(getPointsFromNotation(sourceData.grounding));
    }, [sourceData.angle, sourceData.grounding]);

    const isEditing = editMode === side || editMode === 'both';

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || activePad === null) return;
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        updateJointData(indexToUpdate, jointId, { angle: finalAngle });
        console.log(`[Rotary] Saved angle: ${finalAngle.toFixed(2)} to Pad ${activePad + 1}`);
    }, [activePad, isEditing, jointId, selectedBar, STEPS_PER_BAR, updateJointData]);

    const { angle, handleMouseDown } = useTurntableDrag(displayAngle, handleDragEnd);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isEditing) return;
        if (activePad === null) {
            showNotification("Please select a pad (1-16) to edit.");
            return;
        }

        const newActivePoints = new Set(activePoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        // Update local visual state immediately for responsiveness
        setActivePoints(newActivePoints); 
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        updateJointData(indexToUpdate, jointId, { grounding: newGroundingNotation });
    }, [activePad, activePoints, isEditing, jointId, selectedBar, showNotification, side, STEPS_PER_BAR, updateJointData]);

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle} // Use angle from the hook for live dragging
                activePoints={activePoints} // Use local state for immediate feedback
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown}
            />
        </div>
    );
};
export default RotaryController;