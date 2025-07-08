// src/components/ui/RotaryController/RotaryController.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSequence } from '../../../context/SequenceContext';
import { useMedia } from '../../../context/MediaContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import RotaryButtons from '../RotaryButtons';
import './RotaryController.css';

const RotaryController = ({ deckId, onJointUpdate }) => { // Receives onJointUpdate as a prop
    const { songData, selectedBar, selectedBeat, showNotification, mixerState } = useSequence();
    const { isPlaying, currentBar, currentBeat } = useMedia();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = `${side.charAt(0).toUpperCase()}F`;
    
    const beatIndexToDisplay = isPlaying && selectedBeat === null ? currentBeat - 1 : (selectedBeat ?? 0);
    const barToDisplay = isPlaying && selectedBeat === null ? currentBar : selectedBar;
    
    const sourceData = songData.bars[barToDisplay - 1]?.beats[beatIndexToDisplay]?.joints?.[jointId] || { grounding: `${jointId}0`, angle: 0 };
    
    const [displayAngle, setDisplayAngle] = useState(sourceData.angle);
    const [activePoints, setActivePoints] = useState(() => getPointsFromNotation(sourceData.grounding, side));

    useEffect(() => {
        setDisplayAngle(sourceData.angle);
        setActivePoints(getPointsFromNotation(sourceData.grounding, side));
    }, [sourceData.grounding, sourceData.angle, side]);

    const editMode = mixerState.editMode || 'none';
    const isEditing = editMode === side || editMode === 'both';

    // --- CORRECTED LOGIC ---
    // Uses the onJointUpdate prop passed down from ProLayout
    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditing || selectedBeat === null) return;
        const barIndex = selectedBar - 1;
        const beatIndex = selectedBeat;
        const currentJointData = songData.bars[barIndex]?.beats[beatIndex]?.joints[jointId] || {};
        const updatedJoints = { ...songData.bars[barIndex]?.beats[beatIndex]?.joints, [jointId]: { ...currentJointData, angle: finalAngle } };
        onJointUpdate(barIndex, beatIndex, updatedJoints);
    }, [selectedBeat, isEditing, jointId, selectedBar, songData, onJointUpdate]);

    const { angle, handleMouseDown } = useTurntableDrag(displayAngle, handleDragEnd);

    // --- CORRECTED LOGIC ---
    // Uses the onJointUpdate prop passed down from ProLayout
    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isEditing || selectedBeat === null) {
            showNotification("Please select a pad to edit.");
            return;
        }

        const newActivePoints = new Set(activePoints);
        if (newActivePoints.has(shortNotation)) {
            newActivePoints.delete(shortNotation);
        } else {
            newActivePoints.add(shortNotation);
        }
        
        setActivePoints(newActivePoints); 
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        const barIndex = selectedBar - 1;
        const beatIndex = selectedBeat;
        const currentJointData = songData.bars[barIndex]?.beats[beatIndex]?.joints[jointId] || {};
        const updatedJoints = { ...songData.bars[barIndex]?.beats[beatIndex]?.joints, [jointId]: { ...currentJointData, grounding: newGroundingNotation } };
        onJointUpdate(barIndex, beatIndex, updatedJoints);
    }, [selectedBeat, activePoints, isEditing, jointId, selectedBar, showNotification, side, songData, onJointUpdate]);

    return (
        <div className="turntable-group">
            <RotarySVG
                side={side}
                angle={isEditing ? angle : displayAngle}
                activePoints={activePoints}
                onHotspotClick={handleHotspotClick}
                isEditing={isEditing}
                handleWheelMouseDown={handleMouseDown}
            />
            <RotaryButtons />
        </div>
    );
};
export default RotaryController;