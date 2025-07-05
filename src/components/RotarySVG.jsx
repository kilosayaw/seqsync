import React from 'react';
import classNames from 'classnames';
import { BASE_FOOT_PATHS, FOOT_HOTSPOT_COORDINATES } from '../utils/constants';
import './RotaryController.css';

const RotarySVG = ({
    angle, deckId, activePoints,
    handleWheelMouseDown, joystickRef, handleInteractionStart,
    handleInteractionMove, handleInteractionEnd,
    currentNotation,
}) => {
    const svgSize = 550;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const sideKey = deckId === 'deck1' ? 'L' : 'R';
    const contactPoints = FOOT_HOTSPOT_COORDINATES[sideKey];

    const innerFootSize = 320;
    const innerFootPos = (svgSize - innerFootSize) / 2;
    
    return (
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="rotary-svg-container">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            
            <g transform={`rotate(${angle}, ${centerX}, ${centerY})`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                <image href="/ground/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} />
            </g>

            <g ref={joystickRef} className="joystick-area" onMouseDown={handleInteractionStart} onMouseMove={handleInteractionMove} onMouseUp={handleInteractionEnd} onMouseLeave={handleInteractionEnd} data-current-notation={currentNotation}>
                <rect x="0" y="0" width={svgSize} height={svgSize} fill="transparent" />
                <image href={BASE_FOOT_PATHS[sideKey]} x={innerFootPos} y={innerFootPos + 15} width={innerFootSize} height={innerFootSize} className="base-foot-img" />
                {contactPoints.map(spot => {
                    const isActive = activePoints && activePoints.has(spot.notation);
                    const spotClasses = classNames('hotspot-indicator', { 'active': isActive });
                    const adjustedSpot = {
                        cx: innerFootPos + (spot.cx / svgSize * innerFootSize) * 1.83,
                        cy: innerFootPos + 15 + (spot.cy / svgSize * innerFootSize) * 1.83,
                        r: (spot.r / svgSize * innerFootSize) * 1.83,
                        rx: (spot.rx / svgSize * innerFootSize) * 1.83,
                        ry: (spot.ry / svgSize * innerFootSize) * 1.83,
                    };
                    if (spot.type === 'circle') return <circle key={spot.notation} className={spotClasses} cx={adjustedSpot.cx} cy={adjustedSpot.cy} r={adjustedSpot.r} />;
                    return <ellipse key={spot.notation} className={spotClasses} cx={adjustedSpot.cx} cy={adjustedSpot.cy} rx={adjustedSpot.rx} ry={adjustedSpot.ry} transform={`rotate(${spot.rotation || 0}, ${adjustedSpot.cx}, ${adjustedSpot.cy})`}/>;
                })}
            </g>
            
            <circle cx={centerX} cy={centerY} r={svgSize / 2} stroke="transparent" strokeWidth="100" fill="transparent" className="rotary-wheel-grab-area" onMouseDown={handleWheelMouseDown}/>
        </svg>
    );
};

export default RotarySVG;