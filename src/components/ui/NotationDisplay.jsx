// src/components/ui/NotationDisplay.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { formatFullNotation } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { activePad, selectedBar } = useUIState();
    const { songData, STEPS_PER_BAR } = useSequence();
    const { currentTime } = usePlayback();

    const beatData = activePad !== null ? songData[activePad] : null;

    // DEFINITIVE: Adding 1 to the result for a one-based display.
    const beatInBar = activePad !== null ? (activePad % STEPS_PER_BAR) + 1 : 1;

    const notationText = formatFullNotation(beatData, currentTime, selectedBar, beatInBar);

    return (
        <div className="notation-display-container">
            <span className="notation-text">{notationText}</span>
        </div>
    );
};

export default NotationDisplay;