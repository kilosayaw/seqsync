import React, { useEffect, useState } from 'react';
import { useRotaryDrag } from '../hooks/useRotaryDrag';
import { useGroundingJoystick } from '../hooks/useGroundingJoystick';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext'; // To get the currently playing beat
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ deckId }) => {
    const { selectedBar } = useUIState();
    const { songData, updateJointData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentBeat } = usePlayback();

    // Determine which beat to display/edit data for
    const activeBeatInBar = isPlaying ? currentBeat : (useUIState().activePad ?? currentBeat);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + activeBeatInBar;

    const side = deckId === 'deck1' ? 'left' : 'right';
    const jointId = side === 'left' ? 'LF' : 'RF';
    const currentJointData = songData[globalIndex]?.joints[jointId];

    // Hook for the rotation logic
    const { angle, setAngle, handleMouseDown: handleWheelMouseDown } = useRotaryDrag(finalAngle => {
        if (globalIndex !== -1) {
            updateJointData(globalIndex, jointId, { angle: finalAngle });
        }
    });

    // Hook for the grounding joystick logic (currently a placeholder)
    const { joystickRef, handleInteractionStart, handleInteractionMove, handleInteractionEnd } = useGroundingJoystick(side);
    
    // Sync the wheel's angle with the data from the sequence
    useEffect(() => {
        if (currentJointData) {
            setAngle(currentJointData.angle || 0);
        }
    }, [currentJointData, setAngle]);
    
    return (
        <div className="rotary-controller-container">
            <RotarySVG
                angle={angle}
                deckId={deckId}
                joystickRef={joystickRef}
                handleInteractionStart={handleInteractionStart}
                handleInteractionMove={handleInteractionMove}
                handleInteractionEnd={handleInteractionEnd}
                handleWheelMouseDown={handleWheelMouseDown}
            />
        </div>
    );
};

export default RotaryController;