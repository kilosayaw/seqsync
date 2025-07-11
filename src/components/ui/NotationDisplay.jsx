import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { formatFullNotation } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    // Get all necessary data from contexts
    const { activePad, selectedBar } = useUIState();
    const { songData } = useSequence();
    const { currentTime, isPlaying } = usePlayback();

    // Determine which beat's data to display. Default to the activePad.
    const beatData = activePad !== null ? songData[activePad] : null;

    // Pass the correct data to the formatting utility
    const notationText = formatFullNotation(beatData, currentTime, selectedBar);

    return (
        <div className="notation-display-container">
            <span className="notation-text">{notationText}</span>
        </div>
    );
};

export default NotationDisplay;