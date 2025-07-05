import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { FaPlay, FaPause, FaCircle, FaStop, FaStepBackward, FaBackward, FaForward, FaStepForward } from 'react-icons/fa';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay, stop, isRecording, setIsRecording, bpm, setPlaybackSpeed } = usePlayback();
    const { tap } = useTapTempo(setPlaybackSpeed);

    return (
        <div className="transport-controls-container">
            {/* The transport buttons are now on the left */}
            <div className="button-controls-row">
                <button className="transport-btn"><FaStepBackward /></button>
                <button className="transport-btn"><FaBackward /></button>
                <button className={`transport-btn record-btn ${isRecording ? 'active' : ''}`} onClick={() => setIsRecording(p => !p)}><FaCircle /></button>
                <button className="transport-btn play-btn" onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
                <button className="transport-btn" onClick={stop}><FaStop /></button>
                <button className="transport-btn"><FaForward /></button>
                <button className="transport-btn"><FaStepForward /></button>
            </div>

            {/* The BPM controls are now on the right */}
            <div className="bpm-controls-row">
                <div className="bpm-display">
                    <span className="bpm-value">{Math.round(bpm)}</span>
                    <span className="bpm-label">BPM</span>
                </div>
                <button className="tap-button" onClick={tap}>TAP</button>
            </div>
        </div>
    );
};

export default TransportControls;