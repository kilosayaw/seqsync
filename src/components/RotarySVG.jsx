// src/components/RotarySVG.jsx
import React from 'react';
// CORRECTED PATH: Goes up one level to `src`, then into `utils`.
import { BASE_FOOT_PATHS, FOOT_HOTSPOT_COORDINATES } from '../utils/constants';
import './RotaryController.css';

const RotarySVG = ({
    side,
    angle,
    activePoints,
    onHotspotClick,
    isEditing,
    handleWheelMouseDown
}) => {
    const sideKey = side.charAt(0).toUpperCase();
    const footImage = BASE_FOOT_PATHS[sideKey];
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];

    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                {/* Rotating Group */}
                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    {isEditing && (
                        <image 
                            href={footImage} 
                            x="115" y="115" height="320" width="320" 
                            className="base-foot-img"
                        />
                    )}
                    {hotspots.map(spot => {
                        const isActive = activePoints.has(spot.notation);
                        if (!isActive) return null;

                        if (spot.type === 'ellipse') {
                            return <ellipse key={spot.notation} className="hotspot-indicator" cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                        } else {
                            return <circle key={spot.notation} className="hotspot-indicator" cx={spot.cx} cy={spot.cy} r={spot.r} />;
                        }
                    })}
                </g>

                {/* Stationary Clickable Hotspots */}
                {isEditing && (
                    <g className="hotspot-interaction-layer">
                        {hotspots.map(spot => {
                            if (spot.type === 'ellipse') {
                                return (
                                    <ellipse
                                        key={`${spot.notation}-click`}
                                        className="hotspot-clickable-area"
                                        cx={spot.cx} cy={spot.cy}
                                        rx={spot.rx} ry={spot.ry}
                                        transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`}
                                        onClick={() => onHotspotClick(spot.notation)}
                                    />
                                );
                            } else {
                                return (
                                    <circle
                                        key={`${spot.notation}-click`}
                                        className="hotspot-clickable-area"
                                        cx={spot.cx} cy={spot.cy}
                                        r={spot.r}
                                        onClick={() => onHotspotClick(spot.notation)}
                                    />
                                );
                            }
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
};

export default RotarySVG;