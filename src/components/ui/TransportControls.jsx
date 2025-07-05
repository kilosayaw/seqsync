import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import { FaPlay, FaPause, FaBackward, FaForward } from 'react-icons/fa';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <div className="transport-controls-container">
            <button className="transport-btn" title="Rewind"><FaBackward /></button>
            <button className="transport-btn play-btn" onClick={togglePlay} title="Play/Pause">
                {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="transport-btn" title="Fast Forward"><FaForward /></button>
            <button className="tap-button" onClick={tap}>TAP</button>
        </div>
    );
};

export default TransportControls;