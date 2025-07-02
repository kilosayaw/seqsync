import React, { useEffect, useState } from 'react';
import { useRotaryDrag } from '../hooks/useRotaryDrag';
import { useGroundingJoystick } from '../hooks/useGroundingJoystick';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { FOOT_NOTATION_MAP } from '../utils/constants';
import RotarySVG from './RotarySVG';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { selectedBar, selectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();

    const globalIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const jointId = side === 'left' ? 'LF' : 'RF';
    const currentJointData = globalIndex !== -1 ? songData[globalIndex]?.joints[jointId] : null;

    // Hook for the rotation logic
    const { angle, setAngle, handleMouseDown: handleWheelMouseDown } = useRotaryDrag(finalAngle => {
        if (globalIndex !== -1) {
            updateJointData(globalIndex, jointId, { angle: finalAngle });
        }
    });

    // Hook for the grounding joystick logic
    const { joystickRef, liveNotation, handleInteractionStart, handleInteractionMove, handleInteractionEnd } = useGroundingJoystick(side);
    
    const [savedNotation, setSavedNotation] = useState(side === 'left' ? 'LF123T12345' : 'RF123T12345');

    useEffect(() => {
        if (currentJointData) {
            setAngle(currentJointData.angle || 0);
            setSavedNotation(currentJointData.grounding || (side === 'left' ? 'LF123T12345' : 'RF123T12345'));
        }
    }, [currentJointData, side, setAngle]);

    const displayNotation = liveNotation || savedNotation;
    
    const baseFootKey = side === 'left' ? 'L_BASE_FOOT' : 'R_BASE_FOOT';
    const baseFootPath = FOOT_NOTATION_MAP[baseFootKey]?.path;
    const contactPointPath = FOOT_NOTATION_MAP[displayNotation]?.path;
    
    return (
        <div className="rotary-controller-container">
            <RotarySVG
                angle={angle}
                baseFootPath={baseFootPath}
                contactPointPath={contactPointPath}
                joystickRef={joystickRef}
                handleInteractionStart={handleInteractionStart} // Pass the handler
                handleInteractionMove={handleInteractionMove}
                handleInteractionEnd={() => handleInteractionEnd(selectedBar, selectedBeat)}
                handleWheelMouseDown={handleWheelMouseDown} // Pass the handler
            />
        </div>
    );
};

export default RotaryController;