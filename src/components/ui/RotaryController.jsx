// src/components/ui/RotaryController.jsx
import React, { useEffect, useState, useCallback } from 'react';
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
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    const beatIndexToDisplay = isPlaying ? (currentBeat ?? 0) : (activePad ?? 0);
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
            const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
            updateJointData(indexToUpdate, jointId, { angle: finalAngle });
        }
    }, [selectedBar, activePad, isEditing, jointId, STEPS_PER_BAR, updateJointData]);

    const { handleMouseDown } = useDampedTurntableDrag(angle, setAngle, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        if (!isEditing || activePad === null) {
            console.warn(`[Hotspot] Click ignored. EditMode: ${isEditing}, ActivePad: ${activePad}`);
            return;
        }
        
        const indexToUpdate = ((selectedBar - 1) * STEPS_PER_BAR) + activePad;
        const newActivePoints = new Set(activePoints);

        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        console.log(`%c[Hotspot] Clicked '${shortNotation}'. New notation: ${newGroundingNotation}`, 'color: limegreen');
        
        setActivePoints(newActivePoints);
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