import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { formatTime } from '../utils/notationUtils.js';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { selectedBar } = useUIState();
    const { isPlaying, currentTime, bpm } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();

    let displayBar = selectedBar;
    let displayBeat = 1; // Default to 1

    if (isPlaying && bpm > 0) {
        const beatsPerSecond = bpm / 60;
        const totalSixteenths = Math.floor(currentTime * beatsPerSecond * 4);
        displayBar = Math.floor(totalSixteenths / STEPS_PER_BAR) + 1;
        displayBeat = (totalSixteenths % STEPS_PER_BAR) + 1;
    }

    return (
        <div className="bar-beat-display-container">
            <div className="readout-box">
                <span className="readout-label">BAR</span>
                <span className="readout-value">{String(displayBar).padStart(2, '0')}</span>
            </div>
            <div className="readout-box time-display">
                <span className="readout-label">TIME</span>
                <span className="readout-value-large">{formatTime(currentTime)}</span>
            </div>
            <div className="readout-box">
                <span className="readout-label">BEAT</span>
                <span className="readout-value">{String(displayBeat).padStart(2, '0')}</span>
            </div>
        </div>
    );
};

export default BarBeatDisplay;