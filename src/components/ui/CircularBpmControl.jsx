// src/components/ui/CircularBpmControl.jsx
import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import './CircularBpmControl.css';

const CircularBpmControl = () => {
    const { bpm, setBpm } = usePlayback();
    
    const handleBpmChange = (newBpm) => {
        console.log(`[BPM] Tempo tapped. New BPM: ${newBpm}`);
        setBpm(newBpm);
    };

    const { tap } = useTapTempo(handleBpmChange);

    return (
        <button className="circular-bpm-button" onClick={tap} title="Tap Tempo">
            <span className="circular-bpm-value">{String(Math.round(bpm))}</span>
        </button>
    );
};
export default CircularBpmControl;