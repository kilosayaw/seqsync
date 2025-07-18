import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSequence } from '../../context/SequenceContext';
import { useUIState } from '../../context/UIStateContext';
import { BASE_FOOT_PATHS, FOOT_HOTSPOT_COORDINATES } from '../../utils/constants';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../utils/notationUtils';
import './GroundingEditor.css';

const GroundingEditor = ({ side }) => {
    const { activePad } = useUIState();
    const { songData, updateJointData } = useSequence();
    const sidePrefix = side.charAt(0).toUpperCase();
    const jointId = `${sidePrefix}F`; // 'LF' or 'RF'

    const currentNotation = songData[activePad]?.joints?.[jointId]?.grounding || `${jointId}123T12345`;
    
    // Convert the current notation string into a Set of active points for efficient lookup
    const activePoints = useMemo(() => getPointsFromNotation(currentNotation, side), [currentNotation, side]);

    const handleHotspotClick = (notation) => {
        // Create a new set to avoid direct mutation
        const newPoints = new Set(activePoints);

        if (newPoints.has(notation)) {
            newPoints.delete(notation);
        } else {
            newPoints.add(notation);
        }

        const newNotation = resolveNotationFromPoints(newPoints, side);
        
        // Update the sequence data in the context
        updateJointData(activePad, jointId, { grounding: newNotation });
    };

    const hotspots = FOOT_HOTSPOT_COORDINATES[sidePrefix];

    return (
        <div className="grounding-editor-overlay">
            <svg className="grounding-editor-svg" viewBox="0 0 350 400">
                <image href={BASE_FOOT_PATHS[sidePrefix]} width="350" height="400" />
                {hotspots.map(hotspot => {
                    const isActive = activePoints.has(hotspot.notation);
                    const shapeProps = {
                        key: hotspot.notation,
                        className: `hotspot ${isActive ? 'active' : ''}`,
                        onClick: () => handleHotspotClick(hotspot.notation),
                    };
                    if (hotspot.type === 'circle') {
                        return <circle {...shapeProps} cx={hotspot.cx} cy={hotspot.cy} r={hotspot.r} />;
                    }
                    if (hotspot.type === 'ellipse') {
                        const transform = `rotate(${hotspot.rotation || 0} ${hotspot.cx} ${hotspot.cy})`;
                        return <ellipse {...shapeProps} cx={hotspot.cx} cy={hotspot.cy} rx={hotspot.rx} ry={hotspot.ry} transform={transform} />;
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};

GroundingEditor.propTypes = {
    side: PropTypes.oneOf(['left', 'right']).isRequired,
};

export default GroundingEditor;