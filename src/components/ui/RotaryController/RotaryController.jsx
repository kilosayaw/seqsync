// src/components/ui/RotaryController/RotaryController.jsx

import React, { useEffect, useState, useCallback } from 'react';
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

    // Determine the current beat index to display based on playback state
    // If playing, use the live beat. If paused, use the pad the user has clicked.
    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;

    const currentGrounding = songData[globalIndex]?.joints?.[jointId]?.grounding || `${jointId}0`;
    const currentAngle = songData[globalIndex]?.joints?.[jointId]?.angle || 0;
    
    const [angle, setAngle] = useState(currentAngle);
    const [activePoints, setActivePoints] = useState(new Set());

    // Effect to keep the local component state in sync with the global sequence data
    useEffect(() => {
        setAngle(currentAngle);
        setActivePoints(getPointsFromNotation(currentGrounding));
    }, [currentGrounding, currentAngle, globalIndex]);
    
    const isEditing = editMode === side || editMode === 'both';

    // Callback for when the user finishes dragging the turntable
    const handleDragEnd = useCallback((finalAngle) => {
        // Only update data if a pad is actively selected for editing
        if (isEditing && activePad !== null) {
            const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
            updateJointData(indexToUpdate, jointId, { angle: finalAngle });
        }
    }, [selectedBar, activePad, isEditing, jointId, STEPS_PER_BAR, updateJointData]);

    const { handleMouseDown } = useDampedTurntableDrag(angle, setAngle, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        // Only allow hotspot changes if in edit mode and a pad is selected
        if (!isEditing || activePad === null) return;
        
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        const newActivePoints = new Set(activePoints);

        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        setActivePoints(newActivePoints);
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