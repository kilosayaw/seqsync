import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { formatNotationShorthand } from '../utils/notationUtils'; // Import the new utility
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBeat, selectedBar, selectedJoint } = useUIState();
    const { songData } = useSequence();

    const getGlobalBeatIndex = () => {
        if (selectedBeat === null) return null;
        return ((selectedBar - 1) * 16) + selectedBeat;
    }

    const globalIndex = getGlobalBeatIndex();
    const currentBeatData = globalIndex !== null ? songData[globalIndex] : null;

    const shorthand = formatNotationShorthand(currentBeatData, selectedJoint);

    return (
        <div className="notation-display-compact">
            <span className="notation-label">poSĒQr™:</span>
            <span className="notation-content">{shorthand}</span>
        </div>
    );
};

export default NotationDisplay;