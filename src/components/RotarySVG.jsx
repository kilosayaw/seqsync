// src/components/RotarySVG.jsx
import React from 'react';
import { FOOT_CONTACT_POINTS } from '../utils/constants';

const RotarySVG = ({ side, angle, activePoints, onPointClick, handleWheelMouseDown, isDisabled }) => {
    const svgSize = 550;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const wheelRadius = svgSize / 2;

    const sideKey = side.charAt(0).toUpperCase();
    const allContactPoints = FOOT_CONTACT_POINTS[sideKey];

    if (!Array.isArray(allContactPoints)) return null;

    const onWheelMouseDown = isDisabled ? undefined : handleWheelMouseDown;

    return (
        <svg
            width={svgSize} height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className={`rotary-svg-container ${isDisabled ? 'disabled' : ''}`}
        >
            <g transform={`rotate(${angle}, ${centerX}, ${centerY})`}>
                <image href="/ground/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} />
                <circle cx={centerX} cy={centerY} r={wheelRadius} fill="transparent" className="rotary-grab-area" onMouseDown={onWheelMouseDown} />
                
                {allContactPoints.map(point => (
                    <image
                        key={point.notation}
                        href={point.path}
                        x="75" y="75" width="400" height="400"
                        className={`contact-point-img ${activePoints.has(point.notation) ? 'active' : 'inactive'}`}
                        onClick={() => onPointClick(point.notation)}
                    />
                ))}
            </g>
        </svg>
    );
};

export default RotarySVG;