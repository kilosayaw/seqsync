// src/components/ui/RotaryController/RotarySVG.jsx
import React from 'react';
import { FOOT_HOTSPOT_COORDINATES } from '../../../utils/constants';
import './RotaryController.css';

// DEFINITIVE: Added isFootMode to props
const RotarySVG = ({ side, angle, activePoints, onHotspotClick, isEditing, isFootMode, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
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
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {/* DEFINITIVE: Only show foot graphics if editing in foot mode */}
                    {isEditing && isFootMode && (
                        <>
                            <image href={baseFootImagePath} className="base-foot-img" x="115" y="115" height="320" width="320" />
                            {hotspots.map(spot => {
                                if (!activePoints.has(spot.notation)) return null;
                                if (spot.type === 'ellipse') {
                                    return <ellipse key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                                } else {
                                    return <circle key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} r={spot.r} />;
                                }
                            })}
                        </>
                    )}
                </g>
                
                {/* DEFINITIVE: Only make hotspots clickable if editing in foot mode */}
                {isEditing && isFootMode && (
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