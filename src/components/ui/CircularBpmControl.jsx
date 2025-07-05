import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import './CircularBpmControl.css';

const CircularBpmControl = () => {
    const { bpm, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <button className="circular-bpm-button" onClick={tap} title="Tap Tempo">
            <span className="circular-bpm-value">{String(Math.round(bpm))}</span>
        </button>
    );
};

export default CircularBpmControl;