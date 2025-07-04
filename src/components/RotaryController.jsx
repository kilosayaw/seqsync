import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/groundingUtils';
import RotarySVG from './RotarySVG.jsx';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    // Sourcing state from the correct, single sources of truth
    const { selectedBar, selectedBeat, footEditState } = useUIState();
    const { sequence, updateNotation } = useSequence();

    const [displayPoints, setDisplayPoints] = useState(new Set());
    const [displayAngle, setDisplayAngle] = useState(0);

    const isEditMode = footEditState[side];
    const jointId = side === 'left' ? 'LF' : 'RF';

    // Effect to sync the controller's display with the global sequence data
    useEffect(() => {
        const barIndex = selectedBar - 1;
        const beatData = sequence.bars[barIndex]?.beats[selectedBeat];
        const jointData = beatData?.notation?.[jointId];

        console.log(`[RotaryController-${side}] Syncing display. EditMode: ${isEditMode}. Data for B${selectedBar}:${selectedBeat}`, jointData);

        if (jointData) {
            setDisplayAngle(jointData.angle || 0);
            setDisplayPoints(getPointsFromNotation(jointData.grounding, side));
        } else {
            // Reset to default if no data exists
            setDisplayAngle(0);
            setDisplayPoints(new Set());
        }
    }, [selectedBar, selectedBeat, sequence, side, isEditMode, jointId]);

    const handleNotationUpdate = useCallback((update) => {
        if (!isEditMode) return;
        
        const barIndex = selectedBar - 1;
        const currentNotation = sequence.bars[barIndex]?.beats[selectedBeat]?.notation || {};
        const jointUpdate = { ...currentNotation[jointId], ...update };
        const finalNotation = { ...currentNotation, [jointId]: jointUpdate };
        
        console.log(`[RotaryController-${side}] UPDATE. B:${selectedBar}, Beat:${selectedBeat}`, finalNotation);
        updateNotation(barIndex, selectedBeat, finalNotation);

    }, [isEditMode, selectedBar, selectedBeat, sequence, jointId, updateNotation]);


    const handlePointClick = (pointNotation) => {
        const newPoints = new Set(displayPoints);
        if (newPoints.has(pointNotation)) newPoints.delete(pointNotation);
        else newPoints.add(pointNotation);
        
        handleNotationUpdate({ grounding: resolveNotationFromPoints(newPoints, side) });
    };

    const handleDragEnd = (finalAngle) => {
        handleNotationUpdate({ angle: finalAngle });
    };
    
    return (
        <RotarySVG
            side={side}
            angle={displayAngle}
            setAngle={setDisplayAngle}
            activePoints={displayPoints}
            onPointClick={handlePointClick}
            onDragEnd={handleDragEnd}
            isDisabled={!isEditMode}
        />
    );
};

export default RotaryController;