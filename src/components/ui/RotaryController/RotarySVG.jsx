// src/components/ui/RotaryController/RotarySVG.jsx
import React from 'react';
import classNames from 'classnames';
import { FOOT_HOTSPOT_COORDINATES } from '../../../utils/constants'; // No longer need BASE_FOOT_PATHS
import './RotaryController.css';

const RotarySVG = ({ side, angle, activePoints, onHotspotClick, isEditing, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    
    // Create an array of image paths to render based on active points
    const contactPointImages = activePoints.size > 0 
        ? Array.from(activePoints).map(point => ({
            notation: point,
            // DEFINITIVE PATH FIX: Construct the path for each individual contact point image
            path: `/ground/${sideKey}${point}.png`
          }))
        : [];

    return (
        <div className="rotary-svg-wrapper">
            <svg viewBox="0 0 550 550" className="rotary-svg">
                {/* ... defs for glow filter ... */}
                <defs><filter id="glow"><feGaussianBlur stdDeviation="10" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                
                <g transform={`rotate(${angle}, 275, 275)`} onMouseDown={handleWheelMouseDown} className="rotary-wheel-grab-area">
                    {/* DEFINITIVE PATH FIX */}
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" />
                    
                    {/* Render the active contact point images */}
                    {isEditing && contactPointImages.map(img => (
                        <image 
                            key={img.notation}
                            href={img.path}
                            className="contact-point-img"
                            x="115" y="115" height="320" width="320" 
                        />
                    ))}
                </g>
                {isEditing && ( <g className="interaction-layer"> {hotspots.map(spot => {
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