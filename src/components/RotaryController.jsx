import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/groundingUtils';
import RotarySVG from './RotarySVG.jsx';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { selectedBar, selectedBeat, footEditState } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { isPlaying, activeBeat } = usePlayback();

    const [displayPoints, setDisplayPoints] = useState(new Set());
    const [displayAngle, setDisplayAngle] = useState(0);

    // --- THIS IS THE FIX ---
    // The jointId is now declared at the top-level scope of the component.
    const sideKey = side.charAt(0).toUpperCase();
    const jointId = `${sideKey}F`;

    const isEditMode = footEditState[side];

    const dataIndex = isPlaying ? activeBeat : ((selectedBar - 1) * 16) + selectedBeat;
    const currentBeatData = songData[dataIndex];
    const jointData = currentBeatData?.joints?.[jointId];

    useEffect(() => {
        setDisplayAngle(jointData?.angle || 0);
        setDisplayPoints(getPointsFromNotation(jointData?.grounding, side));
    }, [jointData, side]);

    const handlePointClick = useCallback((pointNotation) => {
        if (!isEditMode) return;

        const newPoints = new Set(displayPoints);
        if (newPoints.has(pointNotation)) newPoints.delete(pointNotation);
        else newPoints.add(pointNotation);

        setDisplayPoints(newPoints);
        
        const newResolvedNotation = resolveNotationFromPoints(newPoints, side);
        const editIndex = ((selectedBar - 1) * 16) + selectedBeat;
        updateJointData(editIndex, jointId, { grounding: newResolvedNotation });
        
    }, [isEditMode, displayPoints, side, selectedBar, selectedBeat, jointId, updateJointData]);

    const handleDragEnd = useCallback((finalAngle) => {
        if (!isEditMode) return;
        
        const editIndex = ((selectedBar - 1) * 16) + selectedBeat;
        updateJointData(editIndex, jointId, { angle: finalAngle });
    }, [isEditMode, selectedBar, selectedBeat, jointId, updateJointData]);
    
    return (
        <RotarySVG
            side={side}
            angle={displayAngle}
            setAngle={setDisplayAngle}
            activePoints={displayPoints}
            onPointClick={handlePointClick}
            onDragEnd={handleDragEnd}
            isDisabled={isPlaying}
        />
    );
};

export default RotaryController;