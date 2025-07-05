// src/components/TransportControls.jsx
import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { FaPlay, FaPause, FaCircle, FaStop, FaBackward, FaForward, FaFastBackward, FaFastForward } from 'react-icons/fa';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay, stop, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <div className="transport-controls-container">
            <div className="transport-button-group">
                <button className="transport-btn" title="Seek to Start"><FaFastBackward /></button>
                <button className="transport-btn" title="-1 Bar"><FaBackward /></button>
                <button className="transport-btn record-btn" title="Record"><FaCircle /></button>
                <button className="transport-btn play-btn" onClick={togglePlay} title="Play/Pause">
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="transport-btn" onClick={stop} title="Stop"><FaStop /></button>
                <button className="transport-btn" title="+1 Bar"><FaForward /></button>
                <button className="transport-btn" title="Seek to End"><FaFastForward /></button>
            </div>
            <button className="tap-button" onClick={tap}>TAP</button>
        </div>
    );
};

export default TransportControls;