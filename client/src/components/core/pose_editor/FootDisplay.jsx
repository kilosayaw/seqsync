import React, { useCallback, useRef, useState } from 'react';

// This helper function maps a click's coordinates to a grounding key.
// It determines the angle and distance to select the correct zone.
const getGroundingRegion = (x, y, radius, side) => {
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    const isToeZone = (Math.sqrt(x**2 + y**2) / radius) > 0.6; // 60% out is "toe-heavy"

    let regionKey = '';
    // These angle ranges correspond to the 8 pie slices.
    if (angle >= 337.5 || angle < 22.5) regionKey = side === 'L' ? '23' : '13';
    else if (angle >= 22.5 && angle < 67.5) regionKey = side === 'L' ? '3' : '1';
    else if (angle >= 67.5 && angle < 112.5) regionKey = 'T345'; // Toes
    else if (angle >= 112.5 && angle < 157.5) regionKey = side === 'L' ? '12T345' : 'R2T345'; // Ambiguous on map, making best guess
    else if (angle >= 157.5 && angle < 202.5) regionKey = '12';
    else if (angle >= 202.5 && angle < 247.5) regionKey = side === 'L' ? '1' : '3';
    else if (angle >= 247.5 && angle < 292.5) regionKey = 'T12'; // Toes
    else if (angle >= 292.5 && angle < 337.5) regionKey = '13';
    
    // This logic is a placeholder based on your files. A full map would be needed.
    // For now, it returns a valid key from your file list.
    if (isToeZone && regionKey.includes('T')) {
        return `${side}${regionKey}`;
    }
    // Fallback to simpler grounding points if not in a toe zone
    if (regionKey === '12') return `${side}12`;
    if (regionKey === '13') return `${side}13`;
    if (regionKey === '23') return `${side}23`;
    if (regionKey === '1') return `${side}1`;
    
    return `${side}123T12345`; // Default fallback
};


const FootDisplay = ({ side, groundPoints, rotation, ankleRotation, onRotate, onGroundingChange, onAnkleRotationChange }) => {
    const joystickRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    
    // Paths to your new image assets in the /public folder
    const wheelImagePath = '/assets/ground/foot-wheel.png';
    const baseFootImagePath = side === 'L' ? '/assets/ground/foot-left.png' : '/assets/ground/foot-right.png';
    
    const activeGroundingImagePath = groundPoints 
        ? `/assets/ground/${groundPoints}.png`
        : baseFootImagePath;

    // Handler for the joystick area (the inner foot)
    const handleJoystickInteraction = (e) => {
        if (!joystickRef.current) return;
        setIsPressed(true);
        
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const handleMove = (moveEvent) => {
            const mouseX = moveEvent.clientX - centerX;
            const mouseY = moveEvent.clientY - centerY;
            const regionKey = getGroundingRegion(mouseX, mouseY, rect.width / 2, side);
            onGroundingChange(side, regionKey);
        };

        const handleUp = () => {
            setIsPressed(false);
            onGroundingChange(side, null); // Clear grounding on release
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
        
        // Initial press logic
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const regionKey = getGroundingRegion(mouseX, mouseY, rect.width / 2, side);
        onGroundingChange(side, regionKey);

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    };

    // Handler for the outer platter rotation
    const handlePlatterDrag = (e) => {
        const platter = e.currentTarget;
        const rect = platter.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = rotation;

        const handleMove = (moveEvent) => {
            const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
            onRotate(side, startRotation + angleDiff);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    };
    
    return (
        <div className="relative w-full max-w-[300px] aspect-square flex flex-col items-center justify-center select-none">
            <div className="relative w-full aspect-square flex items-center justify-center">
                {/* Outer Platter for Rotation */}
                <div
                    className="absolute inset-0 cursor-grab active:cursor-grabbing bg-center bg-no-repeat bg-contain"
                    style={{ 
                        backgroundImage: `url(${wheelImagePath})`,
                        transform: `rotate(${rotation}deg)` 
                    }}
                    onMouseDown={handlePlatterDrag}
                >
                </div>

                {/* Inner Joystick for Grounding */}
                <div
                    ref={joystickRef}
                    className="absolute w-[65%] h-[65%] rounded-full flex items-center justify-center cursor-pointer"
                    onMouseDown={handleJoystickInteraction}
                >
                    <img
                        src={activeGroundingImagePath}
                        alt={groundPoints || `${side} Foot Lifted`}
                        className="w-full h-full object-contain pointer-events-none transition-opacity duration-100"
                        style={{ opacity: isPressed || groundPoints ? 1 : 0.8 }}
                    />
                </div>
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

export default FootDisplay;