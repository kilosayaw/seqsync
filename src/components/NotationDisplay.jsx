import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBeat } = useUIState();
    const { songData } = useSequence();

    const getShorthand = () => {
        if (selectedBeat === null) return '----';
        const pose = songData[selectedBeat]?.poseData;
        // Placeholder for future complex notation logic
        if (!pose || Object.keys(pose).length === 0) return 'EMPTY';
        return `POSE @ B${selectedBeat + 1}`;
    };

    const getPlainEnglish = () => {
        if (selectedBeat === null) return 'No beat selected.';
        const pose = songData[selectedBeat]?.poseData;
        // Placeholder for future complex notation logic
        if (!pose || Object.keys(pose).length === 0) return 'This beat contains no pose data.';
        return `Pose data found for beat ${selectedBeat + 1}. Analysis will be available here.`;
    };

    return (
        <div className="notation-display-container">
            <div className="notation-panel">
                <h3 className="panel-title">poSĒQr™ Shorthand</h3>
                <p className="panel-content">{getShorthand()}</p>
            </div>
            <div className="notation-panel">
                <h3 className="panel-title">Plain English</h3>
                <p className="panel-content">{getPlainEnglish()}</p>
            </div>
        </div>
    );
};

export default NotationDisplay;