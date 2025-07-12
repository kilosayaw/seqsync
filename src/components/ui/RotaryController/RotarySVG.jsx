import React from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../../../utils/constants';
import './RotaryController.css';

// PHOENIX PROTOCOL: This component is now simplified and receives all positional data via props.

const getPivotCoords = (pivotId, hotspots) => {
    if (!pivotId) return { x: 175, y: 175 }; 
    const mainPointId = pivotId.charAt(1); 
    const pivotData = hotspots.find(spot => spot.notation === mainPointId);
    return pivotData ? { x: pivotData.cx, y: pivotData.cy } : { x: 175, y: 175 };
};

const RotarySVG = ({ side, angle, activePoints = new Set(), pivotPoint, onHotspotClick, isFootMode, handleWheelMouseDown, footOffset }) => {
    const sideKey = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey] || [];
    const footImagePath = BASE_FOOT_PATHS[sideKey];

    const footGroupTransform = "translate(100, 100)";
    
    const currentPivotCoords = getPivotCoords(pivotPoint, hotspots);
    const footRotationOrigin = `${currentPivotCoords.x} ${currentPivotCoords.y}`;

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
                
                <g>
                    <g transform={`rotate(${angle}, 275, 275)`}>
                        <image href="/ground/foot-wheel.png" x="0" y="0" width="550" height="550" style={{ pointerEvents: 'none' }} />
                    </g>
                    <g transform={`rotate(${angle}, 275, 275)`}>
                        <circle cx="275" cy="275" r="190" fill="transparent" stroke="transparent" strokeWidth="110" className="rotary-wheel-grab-area" onMouseDown={handleWheelMouseDown}/>
                    </g>
                    
                    {isFootMode && (
                        // PHOENIX PROTOCOL: Now applies the offset passed down from the parent controller.
                        <g transform={`translate(${footOffset.x}, ${footOffset.y}) ${footGroupTransform} rotate(${angle}, ${footRotationOrigin})`}>
                            <g style={{ pointerEvents: 'none' }}>
                                <image href={footImagePath} x="35" y="40" width="280" height="280" className="base-foot-img"/>
                                {hotspots.map(spot => {
                                    if (!activePoints.has(spot.notation)) return null;
                                    const Tag = spot.type === 'ellipse' ? 'ellipse' : 'circle';
                                    return <Tag key={spot.notation} className="hotspot-indicator active" cx={spot.cx} cy={spot.cy} r={spot.r} rx={spot.rx} ry={spot.ry} transform={spot.rotation ? `rotate(${spot.rotation}, ${spot.cx}, ${spot.cy})` : ''} />;
                                })}
                            </g>
                            <g>
                                {hotspots.map(spot => {
                                    const ClickTag = spot.type === 'ellipse' ? 'ellipse' : 'circle';
                                    const clickProps = { ...spot, r: spot.r ? spot.r + 5 : undefined, rx: spot.rx ? spot.rx + 5 : undefined, ry: spot.ry ? spot.ry + 5 : undefined, transform: spot.rotation ? `rotate(${spot.rotation}, ${spot.cx}, ${spot.cy})` : '' };
                                    const handleClick = (e) => { e.stopPropagation(); onHotspotClick(spot.notation); };
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