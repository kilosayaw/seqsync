import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/groundingUtils';
import RotarySVG from './RotarySVG.jsx';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { selectedBar, selectedBeat, selectedJoint } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { isPlaying, activeBeat } = usePlayback();

    const [angle, setAngle] = useState(0);
    const [activePoints, setActivePoints] = useState(new Set());

    const sideKey = side.charAt(0).toUpperCase();
    const jointId = `${sideKey}F`;
    const isEditMode = selectedJoint === jointId;

    const selectedDataIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const displayDataIndex = isPlaying ? activeBeat : selectedDataIndex;
    const displayJointData = displayDataIndex >= 0 && songData[displayDataIndex] ? songData[displayDataIndex].joints[jointId] : null;

    useEffect(() => {
        if (displayJointData) {
            setAngle(displayJointData.angle || 0);
            setActivePoints(getPointsFromNotation(displayJointData.grounding, side));
        } else {
            setAngle(0);
            setActivePoints(new Set());
        }
    }, [displayJointData, side]);

    const handlePointClick = useCallback((pointNotation) => {
        // --- EDIT LOCK ---
        if (!isEditMode) {
            console.log(`[RotaryController-${side}] Point clicked, but edit mode is OFF. Ignoring.`);
            return;
        }
        console.log(`[RotaryController-${side}] Point clicked in EDIT MODE: ${pointNotation}`);
        
        const newPoints = new Set(activePoints);
        if (newPoints.has(pointNotation)) newPoints.delete(pointNotation);
        else newPoints.add(pointNotation);
        setActivePoints(newPoints);
        
        const newResolvedNotation = resolveNotationFromPoints(newPoints, side);
        if (selectedDataIndex >= 0) {
            updateJointData(selectedDataIndex, jointId, { grounding: newResolvedNotation });
        }
    }, [isEditMode, activePoints, side, selectedDataIndex, jointId, updateJointData]);
    
    const handleDragEnd = useCallback((finalAngle) => {
        // --- EDIT LOCK ---
        if (!isEditMode) {
            console.log(`[RotaryController-${side}] Drag ended, but edit mode is OFF. Ignoring.`);
            return;
        }
        console.log(`[RotaryController-${side}] Drag ended in EDIT MODE. Final angle: ${finalAngle}`);

        if (selectedDataIndex >= 0) {
            updateJointData(selectedDataIndex, jointId, { angle: finalAngle });
        }
    }, [isEditMode, selectedDataIndex, jointId, updateJointData]);

    const isUngrounded = activePoints.size === 0;
    const isDisabled = isPlaying || (!isEditMode && isUngrounded);

    return (
        <RotarySVG
            side={side}
            angle={angle}
            setAngle={setAngle}
            activePoints={activePoints}
            onPointClick={handlePointClick}
            onDragEnd={handleDragEnd}
            isDisabled={isDisabled}
        />
    );
};

export default RotaryController;