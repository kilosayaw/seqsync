import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { formatTime } from '../utils/formatTime.js';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { selectedBar, selectedBeat } = useUIState();
    const { bpm, currentTime, isPlaying } = usePlayback();

    const displayBeat = isPlaying && bpm > 0 
        ? (Math.floor(currentTime * (bpm / 60) * 4) % 16) + 1 
        : selectedBeat + 1;

    const displayBar = isPlaying && bpm > 0
        ? Math.floor(currentTime * (bpm / 60) * 4 / 16) + 1
        : selectedBar;

    return (
        <div className="bar-beat-display-container">
            <div className="readout-box bar-display">
                {String(displayBar).padStart(2, '0')}
            </div>
            <div className="readout-box time-display">
                {formatTime(currentTime)}
            </div>
            <div className="readout-box beat-display">
                {String(displayBeat).padStart(2, '0')}
            </div>
        </div>
    );
};

export default BarBeatDisplay;