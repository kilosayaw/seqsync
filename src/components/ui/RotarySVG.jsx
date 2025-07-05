import React from 'react';
import classNames from 'classnames';
import { BASE_FOOT_PATHS, FOOT_HOTSPOT_COORDINATES } from '../../utils/constants';
import './RotaryController.css';

const RotarySVG = ({
    side,
    angle,
    activePoints,
    onHotspotClick,
    isEditing, // Receive the new prop
    handleWheelMouseDown
}) => {
    const sideKey = side.charAt(0).toUpperCase();
    const footImage = BASE_FOOT_PATHS[sideKey];
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];

    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                {/* ... (defs for glow effect remain the same) ... */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {/* UPDATED: Conditionally render the base foot image */}
                    {isEditing && (
                        <image 
                            href={footImage} 
                            x="115" y="115" height="320" width="320" 
                            className="base-foot-img"
                        />
                    )}

                    {/* ... (rendering for active glowing dots remains the same) ... */}
                    {hotspots.map(spot => {
                        const isActive = activePoints.has(spot.notation);
                        if (!isActive) return null;
                        const indicatorClasses = classNames('hotspot-indicator', { 'active': isActive });
                        if (spot.type === 'ellipse') {
                            return <ellipse key={spot.notation} className={indicatorClasses} cx={spot.cx} cy={spot.cy} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                        } else {
                            return <circle key={spot.notation} className={indicatorClasses} cx={spot.cx} cy={spot.cy} r={spot.r} />;
                        }
                    })}
                </g>
                
                {/* UPDATED: Conditionally render the invisible interaction layer */}
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