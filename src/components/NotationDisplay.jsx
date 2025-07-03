import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { formatFullNotation } from '../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBar, selectedBeat } = useUIState();
    const { songData } = useSequence();
    const { currentTime, activeBeat, isPlaying } = usePlayback();

    const displayBeatIndex = isPlaying ? activeBeat : ((selectedBar - 1) * 16) + selectedBeat;
    const beatData = songData[displayBeatIndex];
    
    const displayBar = isPlaying ? Math.floor(displayBeatIndex / 16) + 1 : selectedBar;
    const displayBeat = isPlaying ? (displayBeatIndex % 16) : selectedBeat;

    const notationString = formatFullNotation(beatData, displayBar, displayBeat, currentTime);

    return (
        <div className="notation-display-container">
            {notationString}
        </div>
    );
};

export default NotationDisplay;