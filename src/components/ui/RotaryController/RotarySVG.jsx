// src/components/ui/RotaryController/RotarySVG.jsx
import React from 'react';
import { FOOT_HOTSPOT_COORDINATES } from '../../../utils/constants';
import './RotaryController.css';

const RotarySVG = ({ side, angle, activePoints, onHotspotClick, isEditing, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    // DEFINITIVE PATH FIX 1: Correct path for the base foot image
    const baseFootImagePath = `/ground/foot-${side}.png`;

    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                
                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                    {/* DEFINITIVE PATH FIX 2: Correct path for the turntable wheel */}
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {isEditing && (
                        <>
                            <image href={baseFootImagePath} className="base-foot-img" x="115" y="115" height="320" width="320" />
                            {/* The glowing shapes are drawn with SVG, so they don't need paths */}
                            {hotspots.map(spot => {
                                if (!activePoints.has(spot.notation)) return null;
                                if (spot.type === 'ellipse') {
                                    return <ellipse key={spot.notation} className="hotspot-indicator" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                                } else {
                                    return <circle key={spot.notation} className="hotspot-indicator" cx={spot.cx} cy={spot.cy} r={spot.r} />;
                                }
                            })}
                        </>
                    )}
                </g>
                
                {isEditing && (
                     <g className="interaction-layer">
                        {hotspots.map(spot => {
                            const handleClick = (e) => {
                                e.stopPropagation();
                                onHotspotClick(spot.notation);
                            };
                            if (spot.type === 'ellipse') {
                                return <ellipse key={`${spot.notation}-click`} className="hotspot-clickable-area" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} onMouseDown={handleClick} />;
                            } else {
                                return <circle key={`${spot.notation}-click`} className="hotspot-clickable-area" cx={spot.cx} cy={spot.cy} r={spot.r} onMouseDown={handleClick} />;
                            }
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
};
export default RotarySVG;