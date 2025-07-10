import React from 'react';
import { FOOT_HOTSPOT_COORDINATES } from '../../../utils/constants';
import './RotaryController.css';

// DEFINITIVE FIX: Provide a default value for activePoints to prevent crashes.
const RotarySVG = ({ side, angle, activePoints = new Set(), onHotspotClick, isFootMode, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    
    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {isFootMode && (
                        <>
                            <path d="M382.2,168.9c-2.3-5.2-5.4-9.8-9.1-13.8c-9.1-9.7-21.2-15.1-34.4-15.1c-9.5,0-18.4,3.2-25.5,8.8c-1.3,1-2.5,2-3.7,3.1 c-0.8,0.7-1.5,1.4-2.3,2.1c-12.7,11.8-20.2,28.4-20.2,46.5c0,32.7,26.5,59.2,59.2,59.2s59.2-26.5,59.2-59.2 c0-9.8-2.4-19-6.7-27.1L382.2,168.9z M313.2,232.1c-15,0-27.2-12.2-27.2-27.2s12.2-27.2,27.2-27.2s27.2,12.2,27.2,27.2 C340.4,219.9,328.2,232.1,313.2,232.1z M259.5,237.1c-13.5,0-24.5-11-24.5-24.5s11-24.5,24.5-24.5s24.5,11,24.5,24.5 C283.9,226.1,272.9,237.1,259.5,237.1z M235.1,304.5c-15,0-27.2-12.2-27.2-27.2c0-15,12.2-27.2,27.2-27.2 c15,0,27.2,12.2,27.2,27.2C262.2,292.3,250.1,304.5,235.1,304.5z M276,448.2c-35.3,0-64-28.7-64-64c0-35.3,28.7-64,64-64 s64,28.7,64,64C340,419.5,311.3,448.2,276,448.2z" className="base-foot-img"/>
                            
                            {hotspots.map(spot => {
                                if (!activePoints.has(spot.notation)) return null;
                                // Render either ellipse or circle based on constant data
                                if (spot.type === 'ellipse') {
                                    return <ellipse key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                                } else {
                                    return <circle key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} r={spot.r} />;
                                }
                            })}
                        </>
                    )}
                </g>
                
                {isFootMode && (
                     <g className="interaction-layer">
                        {hotspots.map(spot => {
                            const handleClick = (e) => {
                                e.stopPropagation();
                                onHotspotClick(spot.notation);
                            };
                            if (spot.type === 'ellipse') {
                                return <ellipse key={`${spot.notation}-click`} className="hotspot-clickable-area" cx={spot.cx} cy={spot.cy} rx={spot.rx + 5} ry={spot.ry + 5} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} onMouseDown={handleClick} />;
                            } else {
                                return <circle key={`${spot.notation}-click`} className="hotspot-clickable-area" cx={spot.cx} cy={spot.cy} r={spot.r + 5} onMouseDown={handleClick} />;
                            }
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
};
export default RotarySVG;