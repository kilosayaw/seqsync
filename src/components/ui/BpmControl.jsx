import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useTapTempo } from '../../hooks/useTapTempo';
import './BpmControl.css';

const BpmControl = () => {
    const { bpm, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <div className="bpm-control-container">
            {/* This div now perfectly mimics the DigitalDisplay structure */}
            <div className="bpm-display-module">
                <div className="bpm-display-label">BPM</div>
                <div className="bpm-display-value">{String(Math.round(bpm))}</div>
            </div>
            <button className="bpm-tap-button" onClick={tap}>
                TAP
            </button>
        </div>
    );
};

export default BpmControl;