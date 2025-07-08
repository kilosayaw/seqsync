// src/components/ui/RotaryController/RotaryController.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSequence } from '../../../context/SequenceContext';
import { useMedia } from '../../../context/MediaContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { songData, updateJointData, selectedBar, selectedBeat, showNotification, mixerState } = useSequence();
    const { isPlaying, currentBar, currentBeat } = useMedia();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    const beatIndexToDisplay = isPlaying ? currentBeat - 1 : (selectedBeat ?? 0);
    const barToDisplay = isPlaying ? currentBar : selectedBar;
    
    const sourceData = songData.bars[barToDisplay - 1]?.beats[beatIndexToDisplay]?.joints[jointId] || { grounding: `${jointId}0`, angle: 0 };
    
    const [displayAngle, setDisplayAngle] = useState(sourceData.angle);
    const [activePoints, setActivePoints] = useState(() => getPointsFromNotation(sourceData.grounding, side));

    useEffect(() => {
        setDisplayAngle(sourceData.angle);
        setActivePoints(getPointsFromNotation(sourceData.grounding, side));
    }, [sourceData.angle, sourceData.grounding, side]);

    const isEditing = mixerState.editMode === side || mixerState.editMode === 'both'; 

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || selectedBeat === null) return;
        const barIndex = selectedBar - 1;
        const beatIndex = selectedBeat % 16;
        const currentJointData = songData.bars[barIndex]?.beats[beatIndex]?.joints[jointId] || {};
        updateJointData(barIndex, beatIndex, { ...currentJointData, angle: finalAngle });
        console.log(`[Rotary] Saved angle: ${finalAngle.toFixed(2)} to Bar ${selectedBar}, Pad ${selectedBeat + 1}`);
    }, [selectedBeat, isEditing, jointId, selectedBar, songData, updateJointData]);

    const { angle, handleMouseDown } = useTurntableDrag(displayAngle, handleDragEnd);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isEditing) return;
        if (selectedBeat === null) {
            showNotification("Please select a pad (1-16) to edit.");
            return;
        }

        const newActivePoints = new Set(activePoints);
        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        setActivePoints(newActivePoints); 
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        const barIndex = selectedBar - 1;
        const beatIndex = selectedBeat % 16;
        const currentJointData = songData.bars[barIndex]?.beats[beatIndex]?.joints[jointId] || {};
        updateJointData(barIndex, beatIndex, { ...currentJointData, grounding: newGroundingNotation });
    }, [selectedBeat, activePoints, isEditing, jointId, selectedBar, showNotification, side, songData, updateJointData]);

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={isEditing ? angle : displayAngle}
                activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown}
            />
        </div>
    );
};
export default RotaryController;