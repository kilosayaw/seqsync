// src/components/ui/NotationDisplay.jsx

import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { formatFullNotation } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { songData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentTime, currentBar, currentBeat } = usePlayback();
    const { selectedBar, activePad } = useUIState();

    // DEFINITIVE FIX: Prioritize the activePad for display. Fallback to live beat if playing.
    const beatToDisplay = activePad !== null 
        ? activePad 
        : (isPlaying ? (currentBar - 1) * STEPS_PER_BAR + currentBeat : 0);

    const barToDisplay = Math.floor(beatToDisplay / STEPS_PER_BAR) + 1;
    const beatData = songData[beatToDisplay];

    // Pass the correct bar number to the formatting function
    const displayString = formatFullNotation(beatData, currentTime, barToDisplay);

    return (
        <div className="notation-display-container">
            <div className="notation-text">
                {displayString}
            </div>
        </div>
    );
};

export default NotationDisplay;