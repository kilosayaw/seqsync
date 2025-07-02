import React from 'react';

const RotarySVG = ({
    angle,
    baseFootPath,
    contactPointPath,
    joystickRef,
    handleInteractionStart,
    handleInteractionMove,
    handleInteractionEnd,
    handleWheelMouseDown,
}) => {
    const svgSize = 550;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const innerBoundsSize = 400;
    const innerElementPos = (svgSize - innerBoundsSize) / 2;

    return (
        <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="rotary-svg-container"
        >
            <g 
                transform={`rotate(${angle}, ${centerX}, ${centerY})`} 
                onMouseDown={handleWheelMouseDown}
                style={{ cursor: 'grab' }}
            >
                <image href="/ground/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} />
                
                {baseFootPath && (
                    <image 
                        href={baseFootPath} 
                        x={innerElementPos} y={innerElementPos} 
                        width={innerBoundsSize} height={innerBoundsSize} 
                        className="base-foot-img" 
                    />
                )}
                
                {contactPointPath && (
                    <image 
                        href={contactPointPath} 
                        x={innerElementPos} y={innerElementPos} 
                        width={innerBoundsSize} height={innerBoundsSize} 
                        className="contact-point-img" 
                    />
                )}

                <rect
                    ref={joystickRef}
                    x={innerElementPos}
                    y={innerElementPos}
                    width={innerBoundsSize}
                    height={innerBoundsSize}
                    rx={innerBoundsSize / 2}
                    ry={innerBoundsSize / 2}
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    // === DEFINITIVE FIX IS HERE ===
                    onMouseDown={(e) => handleInteractionStart(e)} // Pass the event object to the handler
                    onMouseMove={handleInteractionMove}
                    onMouseUp={handleInteractionEnd}
                    onMouseLeave={handleInteractionEnd}
                />
            </g>
        </svg>
    );
};

export default RotarySVG;