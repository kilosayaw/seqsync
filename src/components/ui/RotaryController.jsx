import React, { useEffect, useState } from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext'; // <-- THIS LINE WAS MISSING
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

    const beatToDisplay = isPlaying ? (currentBeat ?? 0) : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    const currentGrounding = songData[globalIndex]?.joints?.[jointId]?.grounding || `${jointId}0`;
    const currentAngle = songData[globalIndex]?.joints?.[jointId]?.angle || 0;

    const [angle, setAngle] = useState(currentAngle);
    const [activePoints, setActivePoints] = useState(new Set());

    useEffect(() => {
        setAngle(currentAngle);
        setActivePoints(getPointsFromNotation(currentGrounding));
    }, [currentGrounding, currentAngle, globalIndex]);

    const isEditing = editMode === side || editMode === 'both';

    const handleDragEnd = (finalAngle) => {
        if (isEditing && globalIndex > -1) {
            updateJointData(globalIndex, jointId, { angle: finalAngle });
        }
    };

    const { handleMouseDown } = useDampedTurntableDrag(angle, setAngle, handleDragEnd);

    const handleHotspotClick = (shortNotation) => {
        if (!isEditing || globalIndex < 0) return;
        const newActivePoints = new Set(activePoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
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
                handleWheelMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default RotaryController;