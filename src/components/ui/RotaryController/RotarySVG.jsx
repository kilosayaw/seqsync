import React, { useRef } from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../../../utils/constants';
import './RotaryController.css';

const RotarySVG = ({ side, angle, activePoints = new Set(), onHotspotClick, isFootMode, handleWheelMouseDown }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    const footImagePath = BASE_FOOT_PATHS[sideKey];
    const svgRef = useRef(null);

    const footGroupTransform = "translate(100, 100)";
    
    // This function correctly gets the SVG's position on the page for the drag hook
    const onWheelMouseDown = (e) => {
        if (svgRef.current) {
            handleWheelMouseDown(e, svgRef.current.getBoundingClientRect());
        }
    };

    return (
        <div className="rotary-svg-wrapper">
            <svg ref={svgRef} viewBox="0 0 550 550" className="rotary-svg">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                {/* --- VISUALS GROUP (ROTATES) --- */}
                <g transform={`rotate(${angle}, 275, 275)`}>
                    <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" style={{ pointerEvents: 'none' }} />
                    
                    {isFootMode && (
                        <g transform={footGroupTransform}>
                            <g style={{ pointerEvents: 'none' }}>
                                {/* The green indicators */}
                                {hotspots.map(spot => {
                                    if (!activePoints.has(spot.notation)) return null;
                                    const Tag = spot.type === 'ellipse' ? 'ellipse' : 'circle';
                                    return <Tag key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} r={spot.r} rx={spot.rx} ry={spot.ry} transform={`rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`} />;
                                })}
                                
                                {/* The foot base image on top of indicators */}
                                <image 
                                    href={footImagePath} 
                                    x="35" y="40" 
                                    width="280" height="280" 
                                    className="base-foot-img"
                                />
                            </g>
                        </g>
                    )}
                </g>

                {/* --- INTERACTION GROUP (STATIC) --- */}
                {/* This group sits on top and does NOT rotate. It's for capturing clicks. */}
                <g>
                    {/* The large, invisible circle for grabbing and dragging the wheel */}
                    <circle
                        cx="275"
                        cy="275"
                        r="250" /* A large radius to cover the whole wheel */
                        fill="transparent"
                        className="rotary-wheel-grab-area"
                        onMouseDown={onWheelMouseDown}
                    />

                    {/* The invisible click targets for the foot hotspots */}
                    {isFootMode && (
                         <g transform={`rotate(${angle}, 275, 275)`}>
                             <g transform={footGroupTransform}>
                                {hotspots.map(spot => {
                                    const handleClick = (e) => {
                                        e.stopPropagation(); 
                                        onHotspotClick(spot.notation);
                                    };
                                    const ClickTag = spot.type === 'ellipse' ? 'ellipse' : 'circle';
                                    const clickProps = {
                                        cx: spot.cx, cy: spot.cy,
                                        rx: spot.type === 'ellipse' ? spot.rx + 5 : undefined,
                                        ry: spot.type === 'ellipse' ? spot.ry + 5 : undefined,
                                        r: spot.type === 'circle' ? spot.r + 5 : undefined,
                                        transform: `rotate(${spot.rotation || 0}, ${spot.cx}, ${spot.cy})`
                                    };
                                    return <ClickTag key={`${spot.notation}-click`} className="hotspot-clickable-area" {...clickProps} onMouseDown={handleClick} />;
                                })}
                            </g>
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
};

export default React.memo(RotarySVG);