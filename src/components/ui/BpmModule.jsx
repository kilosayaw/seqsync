import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import './BpmModule.css';

const BpmModule = () => {
    const { bpm, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <div className="bpm-module-container">
            <div className="bpm-module-display">
                <div className="bpm-module-label">BPM</div>
                <div className="bpm-module-value">{String(Math.round(bpm))}</div>
            </div>
            <button className="bpm-module-tap-btn" onClick={tap} title="Tap Tempo" />
        </div>
    );
};

export default BpmModule;