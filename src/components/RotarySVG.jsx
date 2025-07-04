import React from 'react';
import './RotaryController.css';

const RotarySVG = ({
    angle,
    deckId,
    joystickRef,
    handleInteractionStart,
    handleInteractionMove,
    handleInteractionEnd,
    handleWheelMouseDown,
}) => {
    const svgSize = 550; // Use a base size for the viewBox
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const innerBoundsSize = 400; // The area for the inner joystick
    const innerElementPos = (svgSize - innerBoundsSize) / 2;

    return (
        <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="rotary-svg-container"
        >
            {/* The rotating group now controls the entire wheel */}
            <g 
                transform={`rotate(${angle}, ${centerX}, ${centerY})`} 
                onMouseDown={handleWheelMouseDown}
                className="rotary-wheel-grab-area"
            >
                {/* We will add the foot graphics back in the next phase */}
                <image href="/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} />
            </g>

            {/* The joystick area is NOT rotated, so it stays fixed in the center */}
            <rect
                ref={joystickRef}
                x={innerElementPos}
                y={innerElementPos}
                width={innerBoundsSize}
                height={innerBoundsSize}
                rx={innerBoundsSize / 2}
                ry={innerBoundsSize / 2}
                className="joystick-area"
                onMouseDown={handleInteractionStart}
                onMouseMove={handleInteractionMove}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
            />
        </svg>
    );
};

export default RotarySVG;