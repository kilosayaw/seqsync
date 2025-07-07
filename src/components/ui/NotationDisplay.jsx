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

    // Determine which beat's data to display.
    // If playing, use the live beat from the current bar.
    // If paused, use the pad the user has actively selected.
    // Default to beat 0 if no pad is selected.
    const barToDisplay = isPlaying ? currentBar : selectedBar;
    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((barToDisplay - 1) * STEPS_PER_BAR) + beatToDisplay;
    const beatData = songData[globalIndex];

    const displayString = formatFullNotation(beatData, currentTime);

    return (
        <div className="notation-display-container">
            <div className="notation-text">
                {displayString}
            </div>
        </div>
    );
};

export default NotationDisplay;