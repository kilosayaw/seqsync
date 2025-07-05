// src/components/NotationDisplay.jsx
import React from 'react';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { formatFullNotation } from '../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { songData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentTime, currentBeat } = usePlayback();
    const { selectedBar, activePad } = useUIState();

    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;
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