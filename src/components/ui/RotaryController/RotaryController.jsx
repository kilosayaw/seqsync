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
    const beatIndexToDisplay = isPlaying && selectedBar === currentBar ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatIndexToDisplay;
    const currentGrounding = songData[globalIndex]?.joints?.[jointId]?.grounding || `${jointId}0`;
    const currentAngle = songData[globalIndex]?.joints?.[jointId]?.angle || 0;
    const [angle, setAngle] = useState(currentAngle);
    const [activePoints, setActivePoints] = useState(new Set());

    useEffect(() => {
        setAngle(currentAngle);
        setActivePoints(getPointsFromNotation(currentGrounding));
    }, [currentGrounding, currentAngle, globalIndex]);
    
    const isEditing = editMode === side || editMode === 'both';

    const handleDragEnd = useCallback((finalAngle) => {
        if (isEditing && activePad !== null) {
            console.log(`[Rotary] Drag ended for ${jointId}. Saving angle: ${finalAngle.toFixed(2)}`);
            const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
            updateJointData(indexToUpdate, jointId, { angle: finalAngle });
        }
    }, [selectedBar, activePad, isEditing, jointId, STEPS_PER_BAR, updateJointData]);

    const { handleMouseDown } = useDampedTurntableDrag(angle, setAngle, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        if (!isEditing || activePad === null) return;
        
        const newActivePoints = new Set(activePoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
            console.log(`[Rotary] Deselected hotspot: ${shortNotation}`);
        } else {
            newActivePoints.add(shortNotation);
            console.log(`[Rotary] Selected hotspot: ${shortNotation}`);
        }
        
        setActivePoints(newActivePoints);
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        updateJointData(indexToUpdate, jointId, { grounding: newGroundingNotation });
    };

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side} angle={angle} activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown} />
        </div>
    );
};
export default RotaryController;