import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../utils/groundingUtils';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { selectedBar, selectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();

    const dataIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const jointId = side === 'left' ? 'LF' : 'RF';
    const displayData = dataIndex >= 0 ? songData[dataIndex]?.joints[jointId] : null;

    const savedAngle = displayData?.angle || 0;
    const savedNotation = displayData?.grounding;

    const [activePoints, setActivePoints] = useState(new Set());
    const [angle, setAngle] = useState(savedAngle);

    useEffect(() => {
        setAngle(savedAngle);
        // The default should be a full grounding if no notation is present
        const initialPoints = getPointsFromNotation(savedNotation === undefined ? `${jointId}123T12345` : savedNotation, side);
        setActivePoints(initialPoints);
    }, [savedNotation, savedAngle, side, jointId]);

    const handlePointClick = useCallback((pointNotation) => {
        const newPoints = new Set(activePoints);
        if (newPoints.has(pointNotation)) {
            newPoints.delete(pointNotation);
        } else {
            newPoints.add(pointNotation);
        }
        setActivePoints(newPoints);
        
        const newResolvedNotation = resolveNotationFromPoints(newPoints, side);
        if (dataIndex >= 0) {
            updateJointData(dataIndex, jointId, { grounding: newResolvedNotation });
        }
    }, [activePoints, side, dataIndex, jointId, updateJointData]);
    
    const handleDragEnd = useCallback((finalAngle) => {
        if (dataIndex >= 0) {
            updateJointData(dataIndex, jointId, { angle: finalAngle });
        }
    }, [dataIndex, jointId, updateJointData]);

    const isUngrounded = activePoints.size === 0;

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                setAngle={setAngle}
                activePoints={activePoints}
                onPointClick={handlePointClick}
                onDragEnd={handleDragEnd}
                isDisabled={isUngrounded}
            />
        </div>
    );
};

export default RotaryController;