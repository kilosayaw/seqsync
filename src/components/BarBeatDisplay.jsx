// src/components/BarBeatDisplay.jsx
import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { formatTime } from '../utils/formatTime';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { isPlaying, currentTime, bpm, bar, beat } = usePlayback();

    // Use live data if playing, default to 1 otherwise
    const displayBar = isPlaying ? bar : 1;
    const displayBeat = isPlaying ? beat : 1;

    return (
        <div className="bar-beat-display-container">
            {/* Each module is now a self-contained flex column */}
            <div className="display-module">
                <span className="readout-label">BAR</span>
                <div className="readout-box">
                    <span className="readout-value">{String(displayBar).padStart(2, '0')}</span>
                </div>
            </div>
            <div className="display-module time-module">
                <span className="readout-label">TIME</span>
                <div className="readout-box">
                    <span className="readout-value-large">{formatTime(currentTime)}</span>
                </div>
            </div>
            <div className="display-module">
                <span className="readout-label">BEAT</span>
                <div className="readout-box">
                    <span className="readout-value">{String(displayBeat).padStart(2, '0')}</span>
                </div>
            </div>
            <div className="display-module">
                <span className="readout-label">BPM</span>
                <div className="readout-box">
                    <span className="readout-value">{String(Math.round(bpm))}</span>
                </div>
            </div>
        </div>
    );
};

export default BarBeatDisplay;