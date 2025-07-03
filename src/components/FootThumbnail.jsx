import React from 'react';
import { FOOT_HOTSPOT_COORDINATES } from '../utils/constants';
import { getPointsFromNotation } from '../utils/groundingUtils';
import './FootThumbnail.css';

const FootThumbnail = ({ beatData }) => {
    const renderFoot = (side) => {
        const sideKey = side.charAt(0).toUpperCase();
        const jointId = `${sideKey}F`;
        const footData = beatData?.joints?.[jointId];
        
        const allHotspots = FOOT_HOTSPOT_COORDINATES[sideKey];
        const grounding = footData?.grounding;
        const activePoints = getPointsFromNotation(grounding, side);
        const angle = footData?.angle || 0;
        
        // This is the key: show the base if there's no specific grounding data for this foot.
        const isBaseDisplay = !grounding || grounding.endsWith('123T12345');
        
        // Don't render anything if the foot is explicitly ungrounded.
        if (grounding && grounding.endsWith('0')) return null;

        return (
            <svg viewBox="0 0 550 550" className="foot-thumbnail-svg">
                <g transform={`rotate(${angle}, 275, 275)`}>
                    {allHotspots.map(hotspot => {
                        const isActive = activePoints.has(hotspot.notation);
                        const className = `thumbnail-hotspot-indicator ${isActive && !isBaseDisplay ? 'active' : 'base'}`;

                        return hotspot.type === 'ellipse' ? (
                            <ellipse
                                key={hotspot.notation} cx={hotspot.cx} cy={hotspot.cy}
                                rx={hotspot.rx} ry={hotspot.ry}
                                transform={`rotate(${hotspot.rotation}, ${hotspot.cx}, ${hotspot.cy})`}
                                className={className}
                            />
                        ) : (
                            <circle
                                key={hotspot.notation} cx={hotspot.cx} cy={hotspot.cy}
                                r={hotspot.r} className={className}
                            />
                        );
                    })}
                </g>
            </svg>
        );
    };

    return (
        <div className="foot-thumbnail-container">
            <div className="foot-wrapper left">{renderFoot('left')}</div>
            <div className="foot-wrapper right">{renderFoot('right')}</div>
        </div>
    );
};

export default FootThumbnail;