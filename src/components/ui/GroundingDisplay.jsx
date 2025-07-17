import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { getPointsFromNotation } from '../../utils/notationUtils';
import './GroundingDisplay.css';

// A simplified 2D coordinate map for the feet display.
const DISPLAY_COORDS = {
    L: { '1':{x:55,y:40}, '2':{x:25,y:50}, '3':{x:45,y:80}, 'T1':{x:55,y:20}, 'T2':{x:42,y:22}, 'T3':{x:32,y:28}, 'T4':{x:25,y:35}, 'T5':{x:20,y:45} },
    R: { '1':{x:25,y:40}, '2':{x:55,y:50}, '3':{x:35,y:80}, 'T1':{x:25,y:20}, 'T2':{x:38,y:22}, 'T3':{x:48,y:28}, 'T4':{x:55,y:35}, 'T5':{x:60,y:45} }
};

const GroundingDisplay = () => {
    const { activePad } = useUIState();
    const { songData } = useSequence();

    const beatData = songData[activePad];
    if (!beatData || !beatData.joints) {
        // Render an empty state if there's no data, but keep the container for layout stability.
        return <div className="grounding-display-container empty"></div>;
    }

    // Get the grounding notation for both feet from the current beat.
    const leftGrounding = beatData.joints.LF?.grounding || '';
    const rightGrounding = beatData.joints.RF?.grounding || '';

    // Convert the notation strings into sets of active points for easy checking.
    const leftActivePoints = getPointsFromNotation(leftGrounding, 'L');
    const rightActivePoints = getPointsFromNotation(rightGrounding, 'R');

    // Reusable function to render the SVG for a single foot.
    const renderFoot = (side, activePoints) => (
        <svg className="foot-svg" viewBox="0 0 80 100">
            {Object.entries(DISPLAY_COORDS[side]).map(([key, {x, y}]) => {
                const isActive = activePoints.has(key);
                return <circle key={key} cx={x} cy={y} r={isActive ? 5 : 4} className={isActive ? 'active' : ''} />;
            })}
        </svg>
    );

    return (
        <div className="grounding-display-container">
            <div className="foot-display left">
                {renderFoot('L', leftActivePoints)}
            </div>
            <div className="foot-display right">
                {renderFoot('R', rightActivePoints)}
            </div>
        </div>
    );
};

export default GroundingDisplay;