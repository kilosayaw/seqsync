import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBeat, selectedBar } = useUIState();
    const { songData } = useSequence();

    const getGlobalBeatIndex = () => {
        if (selectedBeat === null) return null;
        return ((selectedBar - 1) * 16) + selectedBeat;
    }

    const globalIndex = getGlobalBeatIndex();
    const currentBeatData = globalIndex !== null ? songData[globalIndex] : null;

    const getShorthand = () => {
        if (!currentBeatData) return '----';
        const pose = currentBeatData.poseData;
        if (!pose || Object.keys(pose).length === 0) return 'EMPTY';
        return `POSE @ B${selectedBar}:${selectedBeat + 1}`;
    };

    return (
        <div className="notation-display-compact">
            <span className="notation-label">poSĒQr™:</span>
            <span className="notation-content">{getShorthand()}</span>
        </div>
    );
};

export default NotationDisplay;