import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';

const ControlContainer = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
  cursor: grab;
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
  user-select: none;
`;

const OverlayContainer = styled.div`
  position: absolute;
  width: 70%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FootingImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  transition: transform 0.2s ease-out;
`;

const ZONES = [
    { name: 'L12T12', start: -22.5, end: 22.5 },
    { name: 'L1', start: 22.5, end: 67.5 },
    { name: 'L13', start: 67.5, end: 112.5 },
    { name: 'L3', start: 112.5, end: 157.5 },
    { name: 'L23', start: 157.5, end: 202.5 },
    { name: 'L2', start: 202.5, end: 247.5 },
    { name: 'L12T345', start: 247.5, end: 292.5 },
    { name: 'L12T12', start: 292.5, end: 337.5 },
];

const FootControl = ({ side, groundingState }) => {
    const { setGroundingState } = useSequence();
    const { selectedBar, selectedBeat } = useUIState();
    
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef(null);

    const handleInteraction = useCallback((e) => {
        if (!containerRef.current || selectedBeat === null) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 450) % 360; // Normalize to 0 at top

        const zone = ZONES.find(z => angle >= z.start && angle < z.end);

        if (zone) {
            const finalNotation = `${side.toUpperCase()}${zone.name.substring(1)}`;
            setGroundingState(selectedBar, selectedBeat, side, finalNotation);
        }

        setRotation(angle - 90); // Adjust visual rotation

    }, [containerRef, side, setGroundingState, selectedBar, selectedBeat]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        handleInteraction(e);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        handleInteraction(e);
    };

    const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
    
    const getGroundingStateSrc = (state) => {
        if (!state) return null;
        return `/assets/ground/${state}.png`;
    };

    // <<< FIX: The missing variable definitions are restored >>>
    const footImgSrc = side === 'left' ? '/assets/ground/foot-left.png' : '/assets/ground/foot-right.png';
    const groundingImgSrc = getGroundingStateSrc(groundingState);

    return (
        <ControlContainer
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => { e.preventDefault(); handleMouseDown(e); }}
            onTouchMove={(e) => { e.preventDefault(); handleMouseMove(e); }}
            onTouchEnd={(e) => { e.preventDefault(); handleMouseUp(e); }}
        >
            <BaseImage src="/assets/ground/foot-wheel.png" alt="Control Wheel" />
            <OverlayContainer>
                <FootingImage src={footImgSrc} alt={`${side} foot base`} style={{ opacity: 0.8 }} />
                {groundingImgSrc && (
                    <FootingImage 
                        src={groundingImgSrc} 
                        alt={`Grounding state: ${groundingState}`} 
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                )}
            </OverlayContainer>
        </ControlContainer>
    );
};

FootControl.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  groundingState: PropTypes.string,
};

export default FootControl;