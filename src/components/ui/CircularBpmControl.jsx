// src/components/ui/CircularBpmControl.jsx

import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import './CircularBpmControl.css';

const CircularBpmControl = () => {
    // This hook will eventually be created to provide the setBpm function.
    // For now, we'll use a placeholder.
    const { bpm, setBpm } = usePlayback();
    const { tap } = useTapTempo(setBpm);

    return (
        <button className="circular-bpm-button" onClick={tap} title="Tap Tempo">
            <span className="circular-bpm-value">{String(Math.round(bpm))}</span>
        </button>
    );
};

export default CircularBpmControl;