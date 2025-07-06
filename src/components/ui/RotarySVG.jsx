// src/components/ui/RotarySVG.jsx

import React from 'react';
import classNames from 'classnames';
import { BASE_FOOT_PATHS, FOOT_HOTSPOT_COORDINATES } from '../../utils/constants';
import './RotaryController.css';

const RotarySVG = ({
    side,
    angle,
    activePoints,
    onHotspotClick,
    isEditing,
    handleWheelMouseDown
}) => {
    // Determine which set of assets to use based on the 'side' prop
    const sideKey = side.charAt(0).toUpperCase();
    const footImage = BASE_FOOT_PATHS[sideKey];
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];

    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 
                  This is the main rotating group. ALL children inside this <g> tag will rotate together.
                  The onMouseDown handler is for dragging the entire wheel.
                */}
                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">

                    {/* Layer 1: The visual platter image */}
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {/* Layer 2: The visual foot template image (only visible in edit mode) */}
                    {isEditing && (
                        <image 
                            href={footImage} 
                            x="115" y="115" height="320" width="320" 
                            className="base-foot-img"
                        />
                    )}

                    {/* Layer 3: The glowing dots that indicate active contact points */}
                    {isEditing && hotspots.map(spot => {
                        const isActive = activePoints.has(spot.notation);
                        if (!isActive) return null;
                        
                        const indicatorClasses = classNames('hotspot-indicator', { 'active': isActive });

                        // Render either an ellipse or circle based on the constant data
                        return spot.type === 'ellipse' ? 
                            <ellipse 
                                key={spot.notation} 
                                className={indicatorClasses} 
                                cx={spot.cx} 
                                cy={spot.cy} 
                                rx={spot.rx} 
                                ry={spot.ry} 
                                transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} 
                            /> :
                            <circle 
                                key={spot.notation} 
                                className={indicatorClasses} 
                                cx={spot.cx} 
                                cy={spot.cy} 
                                r={spot.r} 
                            />;
                    })}

                    {/* 
                      Layer 4: The INVISIBLE but CLICKABLE hotspot areas.
                      This layer is now correctly placed *inside* the rotating group.
                    */}
                    {isEditing && (
                        <g className="interaction-layer">
                            {hotspots.map(spot => {
                                // This dedicated handler ensures the click is captured by the hotspot
                                // and not by the parent drag-to-rotate group.
                                const handleHotspotMouseDown = (e) => {
                                    e.stopPropagation(); // CRITICAL: This stops the drag event from firing.
                                    onHotspotClick(spot.notation);
                                };
                                
                                return spot.type === 'ellipse' ?
                                    <ellipse 
                                        key={`${spot.notation}-click`} 
                                        className="hotspot-clickable-area" 
                                        cx={spot.cx} 
                                        cy={spot.cy} 
                                        rx={spot.rx} 
                                        ry={spot.ry} 
                                        transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} 
                                        onMouseDown={handleHotspotMouseDown} 
                                    /> :
                                    <circle 
                                        key={`${spot.notation}-click`} 
                                        className="hotspot-clickable-area" 
                                        cx={spot.cx} 
                                        cy={spot.cy} 
                                        r={spot.r} 
                                        onMouseDown={handleHotspotMouseDown} 
                                    />;
                            })}
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
};

export default RotarySVG;