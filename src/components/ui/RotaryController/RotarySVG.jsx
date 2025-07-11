import React from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../../../utils/constants'; // Import BASE_FOOT_PATHS
import './RotaryController.css';

const RotarySVG = ({ side, angle, activePoints = new Set(), onHotspotClick, isFootMode, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    
    // Use the constant for the image path
    const footImagePath = BASE_FOOT_PATHS[sideKey];

    // DEFINITIVE FIX: This transform perfectly centers the 350x350 graphic inside a 550x550 viewbox.
    // (550 - 350) / 2 = 100.
    const footGroupTransform = "translate(100, 100)";

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
                    <image href="/ground/foot-wheel.png" x="52" y="52" width="450" height="450" style={{ pointerEvents: 'none' }} />
                    
                    {isFootMode && (
                        <g transform={footGroupTransform}>
                            {/* Visuals (non-interactive) */}
                            <g style={{ pointerEvents: 'none' }}>
                                <image 
                                    href={footImagePath} 
                                    x="35" y="40" 
                                    width="280" height="280" 
                                    className="base-foot-img" 
                                />
                                {hotspots.map(spot => {
                                    if (!activePoints.has(spot.notation)) return null;
                                    if (spot.type === 'ellipse') {
                                        return <ellipse key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                                    } else {
                                        return <circle key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} r={spot.r} />;
                                    }
                                })}
                            </g>
                            
                            {/* Clickable Areas */}
                            <g>
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
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
};

export default RotarySVG;