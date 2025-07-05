import React, { useEffect, useState } from 'react';
import { useTurntableDrag } from '../hooks/useTurntableDrag';
import { useGroundingJoystick } from '../hooks/useGroundingJoystick';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { getPointsFromNotation } from '../utils/notationUtils';
import { getRotationalLimits } from '../utils/biomechanics';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const [angle, setAngle] = useState(0);
    const { selectedBar, activePad, selectedJoint } = useUIState();
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBeat } = usePlayback();
    const [isLimitExceeded, setIsLimitExceeded] = useState(false);

    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = selectedJoint && selectedJoint.startsWith(side.toUpperCase()) ? selectedJoint : (side === 'left' ? 'LF' : 'RF');

    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;
    const currentJointData = songData[globalIndex]?.joints[jointId];

    const handleDragEnd = (finalAngle) => {
        if (globalIndex > -1) {
            const limits = getRotationalLimits(currentJointData?.grounding);
            const clampedAngle = Math.max(limits.minAngle, Math.min(finalAngle, limits.maxAngle));
            updateJointData(globalIndex, jointId, { angle: clampedAngle });
            setIsLimitExceeded(false);
        }
    };
    
    const { handleMouseDown } = useTurntableDrag(angle, setAngle, handleDragEnd);
    
    useEffect(() => {
        if (currentJointData) {
            setAngle(currentJointData.angle || 0);
        }
    }, [currentJointData]);
    
    useEffect(() => {
        if (currentJointData) {
            const limits = getRotationalLimits(currentJointData.grounding);
            setIsLimitExceeded(angle > limits.maxAngle || angle < limits.minAngle);
        }
    }, [angle, currentJointData]);

    const { joystickRef, activePoints, handleInteractionStart, handleInteractionMove, handleInteractionEnd } = useGroundingJoystick(side);
    const displayedActivePoints = activePoints ?? getPointsFromNotation(currentJointData?.grounding);

    return (
        <div className={`rotary-controller-container ${isLimitExceeded ? 'limit-exceeded' : ''}`}>
            <RotarySVG
                angle={angle} deckId={deckId} activePoints={displayedActivePoints}
                handleWheelMouseDown={handleMouseDown}
                joystickRef={joystickRef}
                handleInteractionStart={handleInteractionStart}
                handleInteractionMove={handleInteractionMove}
                handleInteractionEnd={() => handleInteractionEnd(globalIndex)}
                currentNotation={currentJointData?.grounding}
            />
        </div>
    );
};

export default RotaryController;