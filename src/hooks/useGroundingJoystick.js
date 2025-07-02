import { useState, useCallback, useRef } from 'react';
import { useSequence } from '../context/SequenceContext';
import { FOOT_CONTACT_ZONES } from '../utils/constants';

const isInsideZone = (x, y, zone) => {
    const distance = Math.sqrt(Math.pow(x - zone.cx, 2) + Math.pow(y - zone.cy, 2));
    return distance < zone.radius;
};

export const useGroundingJoystick = (side) => {
    const { updateJointData } = useSequence();

    const [isDragging, setIsDragging] = useState(false);
    const [liveNotation, setLiveNotation] = useState(null); // Start as null to show saved state first
    const joystickRef = useRef(null);

    // === DEFINITIVE FIX IS HERE ===
    const handleInteractionStart = useCallback((e) => {
        e.stopPropagation(); // Prevent this event from triggering the parent's rotation handler
        console.log('[GroundingJoystick] Interaction Start (Joystick)');
        setIsDragging(true);
    }, []);

    const handleInteractionMove = useCallback((e) => {
        if (!isDragging || !joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const zones = FOOT_CONTACT_ZONES[side.toUpperCase()];
        let currentZone = side === 'left' ? 'LF123T12345' : 'RF123T12345';
        
        for (const zone of zones) {
            if (isInsideZone(x, y, zone)) {
                currentZone = zone.notation;
                break;
            }
        }
        
        setLiveNotation(currentZone);
    }, [isDragging, side]);

    const handleInteractionEnd = useCallback((selectedBar, selectedBeat) => {
        if (!isDragging) return;
        setIsDragging(false);
        setLiveNotation(null); // Clear live notation to show saved state again

        if (selectedBeat !== null && liveNotation) {
            const globalIndex = ((selectedBar - 1) * 16) + selectedBeat;
            const jointId = side === 'left' ? 'LF' : 'RF';
            console.log(`[GroundingJoystick] Interaction End. Committing notation: ${liveNotation} to beat ${globalIndex + 1}`);
            updateJointData(globalIndex, jointId, { grounding: liveNotation });
        } else {
            console.log('[GroundingJoystick] Interaction End. No changes committed.');
        }

    }, [isDragging, liveNotation, side, updateJointData]);

    return {
        joystickRef,
        liveNotation,
        handleInteractionStart,
        handleInteractionMove,
        handleInteractionEnd,
    };
};