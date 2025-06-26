import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useActionLogger } from '../../../hooks/useActionLogger';

// This maps a click's coordinates to a grounding key from your image assets.
const getGroundingRegion = (x, y, radius, side) => {
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 180; // Angle from 0 to 360

    if (angle >= 337.5 || angle < 22.5) return `${side}12`;
    if (angle >= 22.5 && angle < 67.5)  return `${side}12T12345`;
    if (angle >= 67.5 && angle < 112.5) return `${side}T12`;
    if (angle >= 112.5 && angle < 157.5)return `${side}1T1`;
    if (angle >= 157.5 && angle < 202.5)return `${side}1`;
    if (angle >= 202.5 && angle < 247.5)return `${side}13`;
    if (angle >= 247.5 && angle < 292.5)return `${side}3`;
    if (angle >= 292.5 && angle < 337.5)return `${side}23`;
    
    return `${side}123T12345`;
};
const FootDisplay = ({ side, groundPoints, rotation, ankleRotation, onRotate, onGroundingChange, onAnkleRotationChange }) => {
    const log = useActionLogger('FootDisplay');
    const joystickRef = useRef(null);

    const activeGroundingImage = groundPoints ? `/assets/ground/${groundPoints}.png` : `/assets/ground/foot-${side.toLowerCase()}.png`;

    const handleJoystickInteraction = (e) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        
        const updateGrounding = (event) => {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = event.clientX - centerX;
            const mouseY = event.clientY - centerY;
            const regionKey = getGroundingRegion(mouseX, mouseY, rect.width / 2, side);
            
            if (regionKey !== groundPoints) {
                log('GroundingChange', { side, newRegion: regionKey });
                onGroundingChange(side, regionKey);
            }
        };

        const handleMouseUp = () => {
            log('GroundingRelease', { side });
            onGroundingChange(side, null);
            document.removeEventListener('mousemove', updateGrounding);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        updateGrounding(e);
        document.addEventListener('mousemove', updateGrounding);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="relative w-full max-w-[350px] aspect-square flex flex-col items-center justify-center select-none">
            <div 
                className="absolute inset-0 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url(/assets/ground/foot-wheel.png)`, transform: `rotate(${rotation}deg)` }}
            ></div>
            <div
                ref={joystickRef}
                className="absolute w-[60%] h-[60%] rounded-full flex items-center justify-center cursor-pointer"
                onMouseDown={handleJoystickInteraction}
            >
                <img
                    src={activeGroundingImage}
                    alt={groundPoints || `${side} Foot Lifted`}
                    className="w-full h-full object-contain pointer-events-none transition-opacity duration-100"
                    style={{ opacity: groundPoints ? 1 : 0.5 }}
                    draggable="false"
                />
            </div>
             {/* Controls Section */}
            <div className="absolute -bottom-14 text-center w-full">
                {/* Ankle Internal/External Rotation Control */}
                <div className="w-4/5 mx-auto mt-2">
                    <label className="text-xs text-text-muted block mb-1">Ankle In/Ex</label>
                    <input
                        type="range"
                        min="-30"
                        max="30"
                        step="1"
                        value={ankleRotation || 0}
                        onChange={(e) => onAnkleRotationChange(side, Number(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pos-yellow"
                    />
                    <span className="text-xs font-mono text-text-secondary">{ankleRotation || 0}°</span>
                </div>
                 {/* Global Rotation Value Display */}
                <div className="mt-1">
                    <p className="text-xs text-text-muted uppercase">Foot Rot: {Math.round(rotation)}°</p>
                </div>
            </div>
        </div>
    );
};

// --- FULLY IMPLEMENTED PROPTYPES ---
FootDisplay.propTypes = {
  /** Specifies whether this is the Left or Right foot display */
  side: PropTypes.oneOf(['L', 'R']).isRequired,

  /** The string key for the currently active grounding image (e.g., 'L123T12345'). Can be null. */
  groundPoints: PropTypes.string,

  /** The current rotation of the outer platter in degrees. */
  rotation: PropTypes.number,

  /** The current internal/external rotation of the ankle in degrees. */
  ankleRotation: PropTypes.number,

  /** REQUIRED: Callback function when the outer platter is rotated. Passes back (side, newRotation). */
  onRotate: PropTypes.func.isRequired,

  /** REQUIRED: Callback function when the inner joystick is used. Passes back (side, newGroundingKey). */
  onGroundingChange: PropTypes.func.isRequired,

  /** REQUIRED: Callback function when the ankle slider is moved. Passes back (side, newAnkleRotation). */
  onAnkleRotationChange: PropTypes.func.isRequired,
};

export default FootDisplay;