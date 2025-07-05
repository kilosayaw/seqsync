// src/components/RotaryController.jsx
import React, { useEffect, useState } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/notationUtils';
import { useTurntableDrag } from '../hooks/useTurntableDrag'; // Import your drag hook
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { editMode, activePad, selectedBar } = useUIState();
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBeat } = usePlayback();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const sideKey = side.charAt(0).toUpperCase();
    const jointId = `${sideKey}F`;

    // Determine the current beat/pad to edit
    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;

    // Get current grounding and angle data from the sequence
    const currentGrounding = songData[globalIndex]?.joints[jointId]?.grounding || `${jointId}123T12345`;
    const currentAngle = songData[globalIndex]?.joints[jointId]?.angle || 0;
    
    const [angle, setAngle] = useState(currentAngle);
    const [activePoints, setActivePoints] = useState(new Set());

    // Update local state when the global sequence data changes
    useEffect(() => {
        setAngle(currentAngle);
        setActivePoints(getPointsFromNotation(currentGrounding));
    }, [currentGrounding, currentAngle]);
    
    const isEditing = editMode === side || editMode === 'both';

    // Handler for saving the rotation angle
    const handleDragEnd = (finalAngle) => {
        if (isEditing && globalIndex > -1) {
            updateJointData(globalIndex, jointId, { angle: finalAngle });
        }
    };

    // Use your turntable drag hook
    const { handleMouseDown: handleWheelMouseDown } = useTurntableDrag(angle, setAngle, handleDragEnd);

    // Handler for clicking on hotspots
    const handleHotspotClick = (notation) => {
        if (!isEditing) return;

        const pointNotation = notation.replace(sideKey, '').replace('F','');
        const newActivePoints = new Set(activePoints);

        if (newActivePoints.has(pointNotation)) {
            newActivePoints.delete(pointNotation);
        } else {
            newActivePoints.add(pointNotation);
        }
        
        setActivePoints(newActivePoints);
        
        // Update the sequence data immediately
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(globalIndex, jointId, { grounding: newGroundingNotation });
    };

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleWheelMouseDown} // Pass down the drag handler
            />
        </div>
    );
};

export default RotaryController;