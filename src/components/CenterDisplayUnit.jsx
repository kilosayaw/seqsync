import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { formatTime } from '../utils/formatTime.js';
import { seekToPad } from '../utils/playbackUtils.js';

// react-icons import has been COMPLETELY REMOVED.
import './CenterDisplayUnit.css';

const CenterDisplayUnit = () => {
    const { selectedBar, setSelectedBar, selectedBeat, setSelectedBeat, noteDivision, isRecording, setIsRecording } = useUIState();
    const { wavesurfer, duration, bpm, setBpm, currentTime, isPlaying, togglePlay } = usePlayback();
    const { totalBars, barStartTimes } = useSequence();

    const handlePrevBar = () => {
        const newBar = Math.max(1, selectedBar - 1);
        setSelectedBar(newBar);
        seekToPad({ wavesurfer, duration, bpm, padIndex: selectedBeat, bar: newBar, barStartTimes, noteDivision });
    };
    const handleNextBar = () => {
        const newBar = Math.min(totalBars || 1, selectedBar + 1);
        setSelectedBar(newBar);
        seekToPad({ wavesurfer, duration, bpm, padIndex: selectedBeat, bar: newBar, barStartTimes, noteDivision });
    };
    const handlePrevBeat = () => {
        let newBeat = selectedBeat;
        let newBar = selectedBar;
        if (selectedBeat > 0) {
            newBeat = selectedBeat - 1;
        } else {
            newBeat = 15;
            newBar = Math.max(1, selectedBar - 1);
            if (newBar !== selectedBar) setSelectedBar(newBar);
        }
        setSelectedBeat(newBeat);
        seekToPad({ wavesurfer, duration, bpm, padIndex: newBeat, bar: newBar, barStartTimes, noteDivision });
    };
    const handleNextBeat = () => {
        let newBeat = selectedBeat;
        let newBar = selectedBar;
        if (selectedBeat < 15) {
            newBeat = selectedBeat + 1;
        } else {
            newBeat = 0;
            newBar = Math.min(totalBars || 1, selectedBar + 1);
            if (newBar !== selectedBar) setSelectedBar(newBar);
        }
        setSelectedBeat(newBeat);
        seekToPad({ wavesurfer, duration, bpm, padIndex: newBeat, bar: newBar, barStartTimes, noteDivision });
    };

    const handleBpmChange = (e) => setBpm(parseFloat(e.target.value) || 0);

    const displayBeat = isPlaying && bpm > 0 ? (Math.floor(currentTime * (bpm / 60) * 4) % 16) + 1 : selectedBeat + 1;

    return (
        <div className="center-display-unit">
            <div className="display-group">
                <div className="display-box bar">
                    <span className="value">{String(selectedBar).padStart(2, '0')}</span>
                    <span className="label">BAR</span>
                </div>
                <div className="display-box beat">
                    <span className="value">{String(displayBeat).padStart(2, '0')}</span>
                    <span className="label">BEAT</span>
                </div>
            </div>
            <div className="display-box time">
                <span className="value">{formatTime(currentTime)}</span>
            </div>

            {/* ICONS HAVE BEEN REPLACED WITH TEXT SYMBOLS */}
            <div className="transport-grid">
                <div className="transport-group">
                    <button onClick={handlePrevBar}>{'<<'}</button>
                    <span className="transport-label">BAR</span>
                    <button onClick={handleNextBar}>{'>>'}</button>
                </div>
                <div className="transport-group">
                    <button onClick={handlePrevBeat}>{'<'}</button>
                    <span className="transport-label">BEAT</span>
                    <button onClick={handleNextBeat}>{'>'}</button>
                </div>
                <div className="transport-group master-controls">
                    <button onClick={() => setIsRecording(p => !p)} className={`record-button ${isRecording ? 'active' : ''}`}>●</button>
                    <button onClick={togglePlay} className="play-button">{isPlaying ? '❚❚' : '▶'}</button>
                </div>
            </div>

            <div className="bpm-main-display">
                <input type="number" value={bpm.toFixed(0)} onChange={handleBpmChange} className="bpm-input" />
                <button className="tap-button">TAP</button>
            </div>
        </div>
    );
};

export default CenterDisplayUnit;