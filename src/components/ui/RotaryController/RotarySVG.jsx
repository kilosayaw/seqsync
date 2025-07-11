import React from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../../../utils/constants';
import './RotaryController.css';

// Helper to get the coordinates for a given pivot point
const getPivotCoords = (pivotId, hotspots) => {
    if (!pivotId) return { x: 275, y: 275 }; // Default to center
    
    // Find the main contact point (e.g., '1' from 'L1')
    const mainPointId = pivotId.charAt(1);
    const pivotData = hotspots.find(spot => spot.notation === mainPointId);
    
    return pivotData ? { x: pivotData.cx, y: pivotData.cy } : { x: 275, y: 275 };
};


const RotarySVG = ({ side, angle, activePoints = new Set(), pivotPoint, onHotspotClick, isFootMode, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    const footImagePath = BASE_FOOT_PATHS[sideKey];

    const footGroupTransform = "translate(100, 100)";
    
    // DEFINITIVE: Determine the rotation origin based on the selected pivot point.
    const pivotCoords = getPivotCoords(pivotPoint, hotspots);
    const rotationOrigin = `${pivotCoords.x} ${pivotCoords.y}`;

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
                
                <g 
                    transform={`rotate(${angle}, ${rotationOrigin})`} 
                    onMouseDown={handleWheelMouseDown} 
                    className="rotary-wheel-grab-area"
                >
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" style={{ pointerEvents: 'none' }} />
                    
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