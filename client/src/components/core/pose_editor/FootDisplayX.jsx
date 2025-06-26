import React, { useCallback, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useActionLogger } from '../../../hooks/useActionLogger';
import { FOOT_CONTACT_ZONES } from '../../../utils/constants';

const FootDisplay = ({ side, groundPoints, rotation, ankleRotation, onRotate, onGroundingChange, onAnkleRotationChange }) => {
    const log = useActionLogger('FootDisplay');
    const platterRef = useRef(null);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // The inner circle for grounding interaction.
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
    
    // --- Grounding Interaction (Inner Circle) ---
    const handleGroundingInteraction = useCallback((e) => {
        if (!interactionRef.current) return;
        const rect = interactionRef.current.getBoundingClientRect();
        // Default to a full plant if no specific zone is hit, providing tactile feedback
        const zoneNotation = getZoneFromPosition(e.clientX, e.clientY, rect) || `${side}123T12345`;
        
        if (zoneNotation !== groundPoints) {
            onGroundingChange(side, zoneNotation);
        }
    }, [getZoneFromPosition, onGroundingChange, side, groundPoints]);
    
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        setIsInteracting(true);
        // On initial press, register a full grounding contact
        const fullPlantNotation = `${side}123T12345`;
        log('GroundingEngaged', { side, initialContact: fullPlantNotation });
        onGroundingChange(side, fullPlantNotation);
        document.addEventListener('pointermove', handleGroundingInteraction);
        document.addEventListener('pointerup', handlePointerUp);
    }, [side, onGroundingChange, handleGroundingInteraction, log]);
    
    const handlePointerUp = useCallback(() => {
        setIsInteracting(false);
        log('GroundingReleased', { side });
        onGroundingChange(side, null); // Set grounding to null when released
        document.removeEventListener('pointermove', handleGroundingInteraction);
        document.removeEventListener('pointerup', handlePointerUp);
    }, [side, onGroundingChange, log, handleGroundingInteraction]);

    // --- Platter Rotation (Outer Wheel) ---
    const handlePlatterDrag = useCallback((e) => {
        if (!platterRef.current) return;
        e.preventDefault();
        const platter = platterRef.current;
        const rect = platter.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate the angle of the initial click
        const startAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = rotation;

        const handleMove = (moveEvent) => {
            const currentAngleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const angleDiff = (currentAngleRad - startAngleRad) * (180 / Math.PI); // Convert radians to degrees
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
            {/* The Draggable Outer Wheel for Rotation */}
            <div
                ref={platterRef}
                className="absolute inset-0 bg-contain bg-center bg-no-repeat cursor-grab active:cursor-grabbing z-10"
                style={{ 
                    backgroundImage: `url(/assets/ground/foot-wheel.png)`, 
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.05s linear' // Add a slight smoothing
                }}
                onMouseDown={handlePlatterDrag}
                onTouchStart={handlePlatterDrag}
                role="slider"
                aria-label={`${side} foot rotation`}
                aria-valuenow={Math.round(rotation)}
            />

            {/* The Grounding Interaction Pad */}
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

            {/* --- DEFINITIVE FIX: Ankle Slider and Rotation Readout are kept and cleanly separated --- */}
            <div className="absolute -bottom-12 text-center w-full z-30 space-y-2">
                <div className="w-4/5 mx-auto">
                    <label htmlFor={`${side}-ankle-in-ex`} className="text-xs text-text-muted block mb-1">Ankle In/Ex</label>
                    <input
                        id={`${side}-ankle-in-ex`}
                        type="range"
                        min="-30" max="30" step="1"
                        value={ankleRotation || 0}
                        onChange={(e) => onAnkleRotationChange(side, Number(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pos-yellow"
                    />
                    <span className="text-xs font-mono text-text-secondary">{ankleRotation || 0}°</span>
                </div>
                <div>
                    <p className="text-sm text-text-muted uppercase font-semibold">FOOT ROT: <span className="font-mono text-text-primary">{Math.round(rotation)}°</span></p>
                </div>
            </div>
        </div>
    );
};

FootDisplay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  groundPoints: PropTypes.string,
  rotation: PropTypes.number,
  ankleRotation: PropTypes.number,
  onRotate: PropTypes.func.isRequired,
  onGroundingChange: PropTypes.func.isRequired,
  onAnkleRotationChange: PropTypes.func.isRequired,
};

export default FootDisplay;