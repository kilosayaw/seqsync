import React, { useRef, useCallback } from 'react';
import classNames from 'classnames';
import { FOOT_POINTS } from '../utils/constants'; // Assuming this file exists

const RotarySVG = ({ side, angle, setAngle, activePoints, onPointClick, onDragEnd, isDisabled }) => {
    const svgRef = useRef(null);
    const isDragging = useRef(false);
    const startAngle = useRef(0);
    const initialSvgAngle = useRef(0);

    const getAngle = (e) => {
        const svg = svgRef.current;
        if (!svg) return 0;
        const rect = svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    };

    const handleMouseDown = useCallback((e) => {
        if (isDisabled) return;
        e.preventDefault();
        isDragging.current = true;
        startAngle.current = getAngle(e);
        initialSvgAngle.current = angle;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
    }, [angle, isDisabled]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging.current || isDisabled) return;
        e.preventDefault();
        const currentAngle = getAngle(e);
        const deltaAngle = currentAngle - startAngle.current;
        setAngle(initialSvgAngle.current + deltaAngle);
    }, [isDisabled, setAngle]);

    const handleMouseUp = useCallback((e) => {
        if (isDisabled) return;
        e.preventDefault();
        isDragging.current = false;
        if (onDragEnd) {
            onDragEnd(angle);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
    }, [angle, isDisabled, onDragEnd]);

    const containerClasses = classNames('rotary-svg-container', { disabled: isDisabled });
    const points = FOOT_POINTS[side];

    return (
        <div className={containerClasses}>
            <svg ref={svgRef} className="rotary-svg" viewBox="-110 -110 220 220" preserveAspectRatio="xMidYMid meet">
                <g className="base-foot-template">
                    {/* Your SVG path for the foot outline goes here */}
                    <path d="M 50,-90 C 70,-90 85,-70 85,-50 C 85,0 40,60 -10,95 C -60,60 -85,0 -85,-50 C -85,-70 -70,-90 -50,-90 z" fill="#fff"/>
                </g>

                <g className="interaction-layer">
                    {Object.entries(points).map(([key, point]) => (
                        <g key={key}>
                            <circle
                                className={classNames('hotspot-indicator', { active: activePoints.has(key), inactive: !activePoints.has(key) })}
                                cx={point.x} cy={point.y} r={point.r}
                            />
                            <circle
                                className="hotspot-clickable-area"
                                cx={point.x} cy={point.y} r={point.r + 5} /* Larger click area */
                                onClick={() => !isDisabled && onPointClick(key)}
                            />
                        </g>
                    ))}
                </g>

                <g transform={`rotate(${angle})`}>
                    <circle
                        className="rotary-grab-area"
                        cx="0" cy="0" r="100"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                    />
                    {/* Optional: Add a visual handle or indicator for rotation */}
                    <line x1="0" y1="0" x2="0" y2="-90" stroke="#d0d8e0" strokeWidth="2" />
                </g>
            </svg>
        </div>
    );
};

export default RotarySVG;