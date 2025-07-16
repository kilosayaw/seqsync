// src/components/ui/NotationDisplay.jsx

import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { formatFullNotation } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { activePad, selectedBar } = useUIState();
    const { songData } = useSequence();
    const { currentTime, currentBeat } = usePlayback();

    const beatData = activePad !== null ? songData[activePad] : null;

    // DEFINITIVE: Call the upgraded function which now returns a single string.
    const notationText = formatFullNotation(beatData, currentTime, selectedBar, currentBeat);

    return (
        <div className="notation-display-container">
            {/* Render the single string */}
            <span className="notation-text">{notationText}</span>
        </div>
    );
};

export default NotationDisplay;