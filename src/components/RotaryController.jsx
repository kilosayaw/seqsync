// src/components/RotaryController.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTurntableDrag } from '../hooks/useTurntableDrag';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from '../hooks/usePadMapping';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/groundingUtils';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { selectedBar, selectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { isPlaying } = usePlayback();
    const { activeGlobalIndex } = usePadMapping();

    const dataIndex = isPlaying ? activeGlobalIndex : (selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1);
    const jointId = side === 'left' ? 'LF' : 'RF';
    const displayData = dataIndex >= 0 ? songData[dataIndex]?.joints[jointId] : null;

    const sourceAngle = displayData?.angle || 0;
    const savedNotation = displayData?.grounding;

    // ARCHITECTURAL FIX: State is now managed directly in the component.
    const [activePoints, setActivePoints] = useState(new Set());

    // Initialize state from sequence data whenever the selected beat changes.
    useEffect(() => {
        const defaultNotation = side === 'left' ? 'LF123T12345' : 'RF123T12345';
        const initialNotation = savedNotation !== undefined && savedNotation !== null ? savedNotation : defaultNotation;
        setActivePoints(getPointsFromNotation(initialNotation));
    }, [savedNotation, side, dataIndex]); // Rerun when the data source changes

    const { angle, handleMouseDown: handleWheelMouseDown } = useTurntableDrag(/* ... */); // Unchanged

    const handlePointClick = useCallback((pointNotation) => {
        // Create a new set to avoid direct state mutation
        const newPoints = new Set(activePoints);
        if (newPoints.has(pointNotation)) {
            newPoints.delete(pointNotation);
        } else {
            newPoints.add(pointNotation);
        }
        
        // Update the local visual state immediately
        setActivePoints(newPoints);
        
        // Resolve the new notation and commit it to the global sequence
        const newResolvedNotation = resolveNotationFromPoints(newPoints, side);
        if (dataIndex >= 0) {
            updateJointData(dataIndex, jointId, { grounding: newResolvedNotation });
        }
    }, [activePoints, side, dataIndex, jointId, updateJointData]);
    
    const isUngrounded = activePoints.size === 0;

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={activePoints}
                onPointClick={handlePointClick}
                handleWheelMouseDown={handleWheelMouseDown}
                isDisabled={isUngrounded} 
            />
        </div>
    );
};

export default RotaryController;