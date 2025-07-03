import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { formatTime } from '../utils/formatTime.js';
import './BpmDisplay.css';

const BpmDisplay = () => {
    const { selectedBar } = useUIState();
    // Destructure all the necessary functions from the playback context
    const { bpm, currentTime, isPlaying, togglePlay, seekToStart } = usePlayback();
    
    const beatsPerSecond = bpm / 60;
    const currentSixteenth = Math.floor(currentTime * beatsPerSecond * 4);
    const displayBeat = (currentSixteenth % 16) + 1;

    const handleTogglePlay = () => {
        console.log(`[Control] Play/Pause toggled. Was playing: ${isPlaying}`);
        togglePlay(); 
    };

    const handleSeekToStart = () => {
        console.log('[Control] Seek to start.');
        seekToStart();
    };

    return (
        <div className="bpm-display-container">
            <div className="bar-beat-display">
                <div className="display-box">
                    <span className="value">{String(selectedBar).padStart(2, '0')}</span>
                    <span className="label">BAR</span>
                </div>
                <div className="display-box">
                    <span className="value">{String(displayBeat).padStart(2, '0')}</span>
                    <span className="label">BEAT</span>
                </div>
            </div>
            <div className="time-display">{formatTime(currentTime)}</div>
            
            {/* Transport Controls (CORRECTED JSX) */}
            <div className="transport-bar">
                <button onClick={handleSeekToStart}>{'|<'}</button>
                <button>{'<<'}</button> {/* Placeholder */}
                <button className="play-pause-button" onClick={handleTogglePlay}>
                    {isPlaying ? '❚❚' : '▶'}
                </button>
                <button>{'>>'}</button> {/* Placeholder */}
            </div>

            <div className="bpm-main-display">
                <input type="number" value={bpm.toFixed(0)} readOnly className="bpm-input" />
                <button className="tap-button">TAP</button>
            </div>
        </div>
    );
};

export default BpmDisplay;