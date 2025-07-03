import React from 'react';
import { FOOT_HOTSPOT_COORDINATES } from '../utils/constants';
import { getPointsFromNotation } from '../utils/groundingUtils';
import './FootThumbnail.css';

const FootThumbnail = ({ beatData }) => {
    // FIX: Default to an empty object if beatData is null or undefined
    const safeBeatData = beatData || {};
    const leftFootData = safeBeatData.joints?.LF;
    const rightFootData = safeBeatData.joints?.RF;

    const renderFoot = (side, data) => {
        const sideKey = side.charAt(0).toUpperCase();
        const allHotspots = FOOT_HOTSPOT_COORDINATES[sideKey];
        
        // Use provided grounding data, or default to a full plant if none exists.
        const grounding = data?.grounding || `${sideKey}F123T12345`;
        const activePoints = getPointsFromNotation(grounding, side);
        const angle = data?.angle || 0;
        
        // If the grounding is '0' (ungrounded), don't render anything for this foot.
        if (grounding.endsWith('0')) return null;

        return (
            <svg viewBox="0 0 550 550" className="foot-thumbnail-svg">
                <g transform={`rotate(${angle}, 275, 275)`}>
                    {allHotspots.map(hotspot => {
                        const isActive = activePoints.has(hotspot.notation);
                        // Show the base foot (all points) when in edit mode with no specific data
                        const isBaseDisplay = !data?.grounding; 

                        return hotspot.type === 'ellipse' ? (
                            <ellipse
                                key={hotspot.notation}
                                cx={hotspot.cx} cy={hotspot.cy}
                                rx={hotspot.rx} ry={hotspot.ry}
                                transform={`rotate(${hotspot.rotation}, ${hotspot.cx}, ${hotspot.cy})`}
                                className={`thumbnail-hotspot-indicator ${isActive ? 'active' : ''} ${isBaseDisplay ? 'base' : ''}`}
                            />
                        ) : (
                            <circle
                                key={hotspot.notation}
                                cx={hotspot.cx} cy={hotspot.cy}
                                r={hotspot.r}
                                className={`thumbnail-hotspot-indicator ${isActive ? 'active' : ''} ${isBaseDisplay ? 'base' : ''}`}
                            />
                        );
                    })}
                </g>
            </svg>
        );
    };

    return (
        <div className="foot-thumbnail-container">
            <div className="foot-wrapper left">{renderFoot('left', leftFootData)}</div>
            <div className="foot-wrapper right">{renderFoot('right', rightFootData)}</div>
        </div>
    );
};

export default FootThumbnail;