import React, { useRef, useCallback, useEffect, useState } from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../utils/constants';
import { useUIState } from '../context/UIStateContext';

const RotarySVG = ({ side, angle, setAngle, activePoints, onPointClick, onDragEnd, isDisabled }) => {
    const svgSize = 550;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const newSize = 340;
    const xOffset = 105;
    const yOffset = 109;

    const { footEditState } = useUIState();
    const sideKey = side.charAt(0).toUpperCase();
    const allHotspots = FOOT_HOTSPOT_COORDINATES[sideKey];
    const baseFootPath = BASE_FOOT_PATHS[sideKey];
    const isEditMode = footEditState[side];

    const [isDragging, setIsDragging] = useState(false);
    const lastMouseAngleRef = useRef(0);
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const centerRef = useRef({ x: 0, y: 0 });

    const animate = useCallback(() => {
        velocityRef.current *= 0.95;
        if (Math.abs(velocityRef.current) < 0.01) {
            cancelAnimationFrame(animationFrameRef.current);
            if (typeof onDragEnd === 'function') setAngle(current => { onDragEnd(current); return current; });
            return;
        }
        setAngle(prev => prev + velocityRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [onDragEnd, setAngle]);

    // --- THIS IS THE JITTER FIX ---
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        
        // Calculate the raw angle in degrees
        let currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        
        // Normalize the angle to be within a 0-360 range for consistent delta calculation
        if (currentMouseAngle < 0) {
            currentMouseAngle += 360;
        }

        let delta = currentMouseAngle - lastMouseAngleRef.current;
        
        // Handle the "wrap-around" issue when crossing the 0/360 degree boundary
        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }
        
        // Apply the smooth delta to the component's angle state
        setAngle(prev => prev + delta);
        
        // Update velocity for momentum physics, slightly dampened
        velocityRef.current = delta * 0.85; 
        
        // Store the current normalized angle for the next frame's calculation
        lastMouseAngleRef.current = currentMouseAngle;

    }, [isDragging, setAngle]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        if (Math.abs(velocityRef.current) > 0.01) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else if (typeof onDragEnd === 'function') {
            onDragEnd(angle);
        }
    }, [isDragging, animate, angle, onDragEnd]);

    const handleMouseDown = useCallback((e) => {
        if (isDisabled || e.target.closest('.hotspot-group')) return;
        e.stopPropagation();
        setIsDragging(true);
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    }, [isDisabled]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    if (!allHotspots) return null;

    return (
        <svg
            width={svgSize} height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className={`rotary-svg-container ${isDisabled ? 'disabled' : ''}`}
        >
            <g transform={`rotate(${angle}, ${centerX}, ${centerY})`}>
                <image href="/ground/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} style={{ pointerEvents: 'none' }} />
                <circle cx={centerX} cy={centerY} r={svgSize / 2} fill="transparent" className="rotary-grab-area" onMouseDown={handleMouseDown} />
                
                {isEditMode && (
                    <image href={baseFootPath} x={xOffset} y={yOffset} width={newSize} height={newSize} className="base-foot-template" />
                )}

                {allHotspots.map(hotspot => (
                    <g key={hotspot.notation} onClick={() => onPointClick(hotspot.notation)} className="hotspot-group">
                        {hotspot.type === 'ellipse' ? (
                            <>
                                <ellipse
                                    cx={hotspot.cx} cy={hotspot.cy}
                                    rx={hotspot.rx} ry={hotspot.ry}
                                    transform={`rotate(${hotspot.rotation}, ${hotspot.cx}, ${hotspot.cy})`}
                                    className={`hotspot-indicator ${activePoints.has(hotspot.notation) ? 'active' : 'inactive'}`}
                                />
                                <ellipse
                                    cx={hotspot.cx} cy={hotspot.cy}
                                    rx={hotspot.rx + 5} ry={hotspot.ry + 5}
                                    transform={`rotate(${hotspot.rotation}, ${hotspot.cx}, ${hotspot.cy})`}
                                    fill="transparent"
                                    className="hotspot-clickable-area"
                                />
                            </>
                        ) : (
                            <>
                                <circle
                                    cx={hotspot.cx} cy={hotspot.cy}
                                    r={hotspot.r}
                                    className={`hotspot-indicator ${activePoints.has(hotspot.notation) ? 'active' : 'inactive'}`}
                                />
                                <circle
                                    cx={hotspot.cx} cy={hotspot.cy}
                                    r={hotspot.r + 5}
                                    fill="transparent"
                                    className="hotspot-clickable-area"
                                />
                            </>
                        )}
                    </g>
                ))}
            </g>
        </svg>
    );
};

export default RotarySVG;