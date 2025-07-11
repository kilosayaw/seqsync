// src/components/ui/SmallTransportControls.jsx
import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { FaPlay, FaPause } from 'react-icons/fa';
import './SmallTransportControls.css';

const SmallTransportControls = () => {
    const { isPlaying, togglePlay } = usePlayback();

    return (
        <div className="small-transport-container">
            <button className="small-transport-btn play-btn" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
        </div>
    );
};

export default SmallTransportControls;