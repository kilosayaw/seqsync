import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { useMedia } from '../../context/MediaContext';
import { formatFullNotation } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { songData, selectedBeat, currentBar: selectedBar } = useSequence();
    const { isPlaying, currentTime, currentBar, currentBeat } = useMedia();
    const barToDisplay = isPlaying ? currentBar : selectedBar;
    const beatIndexInBar = isPlaying ? currentBeat - 1 : (selectedBeat ?? 0);
    const beatData = songData.bars[barToDisplay - 1]?.beats[beatIndexInBar];
    const displayString = formatFullNotation(beatData, currentTime);
    return ( <div className="notation-display-container"><div className="notation-text">{displayString}</div></div> );
};
export default NotationDisplay;