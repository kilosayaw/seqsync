import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';

const ControlContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;
  &:active {
    cursor: grabbing;
  }
`;

const BaseImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
`;

// --- UPDATED ZONES ARRAY ---
// This now covers all 360 degrees, mapping to your .png files.
// Angles are calculated with 0 at the top, moving clockwise.
// Each zone is approx 22.5 degrees.
const ZONES = [
    { name: '12', start: 0, end: 22.5 },
    { name: '1', start: 22.5, end: 45 },
    { name: 'T1', start: 45, end: 67.5 },
    { name: '13', start: 67.5, end: 90 },
    { name: 'R13T1', start: 90, end: 112.5 }, // Assuming R prefix is handled dynamically
    { name: '3', start: 112.5, end: 135 },
    { name: 'R23T1', start: 135, end: 157.5 },
    { name: '23', start: 157.5, end: 180 },
    { name: 'R2T1', start: 180, end: 202.5 },
    { name: '2', start: 202.5, end: 225 },
    { name: 'T345', start: 225, end: 247.5 },
    { name: '12T345', start: 247.5, end: 270 },
    { name: 'T123', start: 270, end: 292.5 },
    { name: 'T12345', start: 292.5, end: 315 },
    { name: '12T12345', start: 315, end: 337.5 },
    { name: '12T12', start: 337.5, end: 360 },
];

const FootControl = ({ side }) => {
    const { setGroundingForBeat, getBeatData } = useSequence();
    const { selectedBar, editingBeatIndex } = useUIState();
    const containerRef = useRef(null);
    const isInteracting = useRef(false);

    const currentBeatData = getBeatData(selectedBar, editingBeatIndex);
    const groundingState = currentBeatData?.pose?.grounding?.[side.toUpperCase()];

    const handleInteractionLogic = useCallback((e) => {
        if (!containerRef.current || editingBeatIndex === null) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;

        const zone = ZONES.find(z => angle >= z.start && angle < z.end);

        if (zone) {
            // Remove hardcoded 'R' and use the side prop dynamically
            const zoneName = zone.name.startsWith('R') ? zone.name.substring(1) : zone.name;
            const finalNotation = `${side.toUpperCase()}${zoneName}`;
            setGroundingForBeat(selectedBar, editingBeatIndex, side, finalNotation);
        }
    }, [containerRef, side, setGroundingForBeat, selectedBar, editingBeatIndex]);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        if (editingBeatIndex === null) return;
        isInteracting.current = true;
        
        const fullPlantedNotation = `${side.toUpperCase()}123T12345`;
        setGroundingForBeat(selectedBar, editingBeatIndex, side, fullPlantedNotation);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('touchend', handleMouseUp);
    }, [side, setGroundingForBeat, selectedBar, editingBeatIndex]);

    const handleMouseMove = useCallback((e) => {
        e.preventDefault();
        if (isInteracting.current) handleInteractionLogic(e);
    }, [handleInteractionLogic]);

    const handleMouseUp = useCallback(() => {
        isInteracting.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
    }, []);

    const wheelSrc = "/assets/ground/foot-wheel.png";
    const footSrc = side === 'left' ? "/assets/ground/foot-left.png" : "/assets/ground/foot-right.png";
    const groundingSrc = groundingState ? `/assets/ground/${groundingState}.png` : null;

    return (
        <ControlContainer
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <BaseImage src={wheelSrc} alt="Control Wheel" />
            <BaseImage src={footSrc} alt={`${side} foot outline`} />
            {groundingSrc && (
                <BaseImage 
                    src={groundingSrc} 
                    alt={`Grounding state: ${groundingState}`} 
                />
            )}
        </ControlContainer>
    );
};

FootControl.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
};

export default FootControl;