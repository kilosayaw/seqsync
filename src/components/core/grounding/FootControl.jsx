// /client/src/components/core/grounding/FootControl.jsx
import React, { useCallback, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useActionLogger } from '../../../hooks/useActionLogger';
import { FOOT_CONTACT_ZONES } from '../../../utils/constants';

// ... The component's main logic remains unchanged ...
const FootControl = ({ side, groundPoints, rotation, ankleRotation, onRotate, onGroundingChange, onAnkleRotationChange }) => {
    const log = useActionLogger('FootDisplay');
    const platterRef = useRef(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const interactionRef = useRef(null); 
    const contactZones = useMemo(() => FOOT_CONTACT_ZONES[side], [side]);

    const getZoneFromPosition = useCallback((x, y, rect) => {
        const normX = (x - rect.left) / rect.width;
        const normY = (y - rect.top) / rect.height;
        for (const zone of contactZones) {
            const dx = normX - zone.cx;
            const dy = normY - zone.cy;
            if (dx * dx + dy * dy < zone.radius * zone.radius) {
                return zone.notation;
            }
        }
        return null;
    }, [contactZones]);
    
    const handleGroundingInteraction = useCallback((e) => {
        if (!interactionRef.current) return;
        const rect = interactionRef.current.getBoundingClientRect();
        const zoneNotation = getZoneFromPosition(e.clientX, e.clientY, rect) || `${side}123T12345`;
        
        if (zoneNotation !== groundPoints) {
            onGroundingChange(side, zoneNotation);
        }
    }, [getZoneFromPosition, onGroundingChange, side, groundPoints]);
    
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        setIsInteracting(true);
        const fullPlantNotation = `${side}123T12345`;
        log('GroundingEngaged', { side, initialContact: fullPlantNotation });
        onGroundingChange(side, fullPlantNotation);
        document.addEventListener('pointermove', handleGroundingInteraction);
        document.addEventListener('pointerup', handlePointerUp);
    }, [side, onGroundingChange, handleGroundingInteraction, log]); // handlePointerUp was missing here
    
    const handlePointerUp = useCallback(() => {
        setIsInteracting(false);
        log('GroundingReleased', { side });
        onGroundingChange(side, null);
        document.removeEventListener('pointermove', handleGroundingInteraction);
        document.removeEventListener('pointerup', handlePointerUp);
    }, [side, onGroundingChange, log, handleGroundingInteraction]);

    const handlePlatterDrag = useCallback((e) => {
        if (!platterRef.current) return;
        e.preventDefault();
        const platter = platterRef.current;
        const rect = platter.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const startAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = rotation;

        const handleMove = (moveEvent) => {
            const currentAngleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const angleDiff = (currentAngleRad - startAngleRad) * (180 / Math.PI);
            onRotate(side, startRotation + angleDiff);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleUp);
    }, [rotation, side, onRotate]);

    const baseFootImage = `/assets/ground/foot-${side.toLowerCase()}.png`;
    const activeGroundingImage = groundPoints ? `/assets/ground/${groundPoints}.png` : baseFootImage;

    return (
        <div className="relative w-[250px] h-[250px] flex flex-col items-center justify-center select-none">
            <div
                ref={platterRef}
                className="absolute inset-0 bg-contain bg-center bg-no-repeat cursor-grab active:cursor-grabbing z-10"
                style={{ 
                    backgroundImage: `url(/assets/ground/foot-wheel.png)`, 
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.05s linear'
                }}
                onMouseDown={handlePlatterDrag}
                onTouchStart={handlePlatterDrag}
                role="slider"
                aria-label={`${side} foot rotation`}
                aria-valuenow={Math.round(rotation)}
            />
            <div
                ref={interactionRef}
                className="absolute w-[65%] h-[65%] rounded-full cursor-pointer z-20"
                onPointerDown={handlePointerDown}
            >
                <img src={baseFootImage} alt={`${side} Foot Outline`} className="w-full h-full object-contain pointer-events-none opacity-20" draggable="false" />
                <img
                    src={activeGroundingImage}
                    alt={groundPoints || `${side} Foot Lifted`}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-100"
                    style={{ opacity: isInteracting ? 1 : 0.2 }}
                    draggable="false"
                />
            </div>
            <div className="absolute -bottom-12 text-center w-full z-30 space-y-2">
                <div className="w-4/5 mx-auto">
                    <label htmlFor={`${side}-ankle-in-ex`} className="text-xs text-slate-400 block mb-1">Ankle In/Ex</label>
                    <input
                        id={`${side}-ankle-in-ex`}
                        type="range"
                        min="-30" max="30" step="1"
                        value={ankleRotation || 0}
                        onChange={(e) => onAnkleRotationChange(side, Number(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <span className="text-xs font-mono text-slate-300">{ankleRotation || 0}°</span>
                </div>
                <div>
                    <p className="text-sm text-slate-400 uppercase font-semibold">FOOT ROT: <span className="font-mono text-white">{Math.round(rotation)}°</span></p>
                </div>
            </div>
        </div>
    );
};

// --- THIS IS THE ONLY CHANGE ---
FootControl.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired, // Changed from 'left', 'right'
  groundPoints: PropTypes.string,
  rotation: PropTypes.number,
  ankleRotation: PropTypes.number,
  onRotate: PropTypes.func.isRequired,
  onGroundingChange: PropTypes.func.isRequired,
  onAnkleRotationChange: PropTypes.func.isRequired,
};

export default FootControl;