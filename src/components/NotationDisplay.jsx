import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { BLAZEPOSE_KEYPOINTS } from '../utils/constants'; // Import the master list
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBeat, selectedBar, selectedJoint } = useUIState();
    const { songData } = useSequence();

    // This function now generates the shorthand based on the current context
    const generateShorthand = () => {
        if (selectedBeat === null) {
            return '----';
        }

        const globalIndex = ((selectedBar - 1) * 16) + selectedBeat;
        const beatData = songData[globalIndex];

        if (!beatData?.poseData) {
            return 'EMPTY';
        }

        // If a specific joint is also selected, provide more detail
        if (selectedJoint !== null) {
            const jointInfo = beatData.poseData.keypoints?.[selectedJoint];
            const jointAbbreviation = BLAZEPOSE_KEYPOINTS.find(j => j.index === selectedJoint)?.id || '??';
            
            if (jointInfo) {
                const x = jointInfo.x.toFixed(2);
                const y = jointInfo.y.toFixed(2);
                const z = (jointInfo.z || 0).toFixed(2);
                return `${jointAbbreviation} @ (${x}, ${y}, ${z})`;
            }
        }
        
        // Default message if a beat with a pose is selected, but no specific joint
        return `POSE @ B${selectedBar}:${selectedBeat + 1}`;
    };

    return (
        <div className="notation-display-compact">
            <span className="notation-label">poSĒQr™:</span>
            <span className="notation-content">{generateShorthand()}</span>
        </div>
    );
};

export default NotationDisplay;