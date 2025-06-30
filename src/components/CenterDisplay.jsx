import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';
import './CenterDisplay.css';

const CenterDisplay = () => {
    const { isPlaying, togglePlay, bpm } = usePlayback();
    const { selectedBar } = useUIState();

    return (
        <div className="center-display-container">
            <div className="knob-placeholder"></div>
            <div className="digital-display-section">
                <div className="transport-bar">
                    <button className="transport-btn"><FaStepBackward /></button>
                    <button className="transport-btn play" onClick={togglePlay}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button className="transport-btn"><FaStepForward /></button>
                </div>
                <div className="seven-segment-display">
                    <div className="segment-group">
                        <span>BAR</span>
                        <div className="segment-number">{String(selectedBar).padStart(2, '0')}</div>
                    </div>
                     <div className="segment-group">
                        <span>BPM</span>
                        <div className="segment-number">{String(bpm).padStart(3, '0')}</div>
                    </div>
                </div>
            </div>
            <div className="knob-placeholder"></div>
        </div>
    );
}

export default CenterDisplay;