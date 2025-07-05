// src/components/RotaryController.jsx
import React, { useEffect, useState } from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../utils/notationUtils';
import { useDampedTurntableDrag } from '../../hooks/useDampedTurntableDrag';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { editMode, activePad, selectedBar } = useUIState();
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBeat } = usePlayback();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const sideKey = side.charAt(0).toUpperCase();
    const jointId = `${sideKey}F`;

    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;

    const currentGrounding = songData[globalIndex]?.joints[jointId]?.grounding || `${jointId}123T12345`;
    const currentAngle = songData[globalIndex]?.joints[jointId]?.angle || 0;
    
    const [angle, setAngle] = useState(currentAngle);
    const [activePoints, setActivePoints] = useState(new Set());

    useEffect(() => {
        setAngle(currentAngle);
        setActivePoints(getPointsFromNotation(currentGrounding));
    }, [currentGrounding, currentAngle]);
    
    const isEditing = editMode === side || editMode === 'both';

    const handleDragEnd = (finalAngle) => {
        if (isEditing && globalIndex > -1) {
            const normalizedAngle = (finalAngle % 360 + 540) % 360 - 180;
            updateJointData(globalIndex, jointId, { angle: normalizedAngle });
        }
    };

    const { handleMouseDown } = useDampedTurntableDrag(angle, setAngle, handleDragEnd);

    // --- DEFINITIVE FIX FOR DESELECTION ---
    const handleHotspotClick = (shortNotation) => {
        if (!isEditing) return;

        // Create a new Set from the current state to ensure we're not mutating it directly.
        const newActivePoints = new Set(activePoints);

        // The logic is now a simple, robust toggle.
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        // Update both the local visual state and the global sequence data.
        setActivePoints(newActivePoints);
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
                handleWheelMouseDown={handleMouseDown} // This is correctly passed now.
            />
        </div>
    );
};

export default RotaryController;