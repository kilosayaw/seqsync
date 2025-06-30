import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { FaPlay, FaPause, FaCircle, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward } from 'react-icons/fa';
import './CenterDisplayUnit.css';

const CenterDisplayUnit = () => {
    const { isPlaying, isRecording, togglePlay, toggleRecording, bpm, setBpm, currentBeat } = usePlayback();
    const { selectedBar, setSelectedBar, selectedBeat, setSelectedBeat } = useUIState();
    const { totalBars } = useSequence();
    const { tap } = useTapTempo(setBpm);

    const handlePrevBar = () => setSelectedBar(p => Math.max(1, p - 1));
    const handleNextBar = () => setSelectedBar(p => Math.min(totalBars, p + 1));

    const handlePrevBeat = () => {
        const currentSelection = selectedBeat === null ? currentBeat : selectedBeat;
        if (currentSelection > 0) {
            setSelectedBeat(currentSelection - 1);
        } else if (selectedBar > 1) { // Wrap to previous bar
            handlePrevBar();
            setSelectedBeat(15);
        }
    };

    const handleNextBeat = () => {
        const currentSelection = selectedBeat === null ? currentBeat : selectedBeat;
        if (currentSelection < 15) {
            setSelectedBeat(currentSelection + 1);
        } else if (selectedBar < totalBars) { // Wrap to next bar
            handleNextBar();
            setSelectedBeat(0);
        }
    };

    // Display live playhead when playing, otherwise show the selected beat
    const beatToDisplay = isPlaying ? currentBeat + 1 : (selectedBeat !== null ? selectedBeat + 1 : 0);

    return (
        <div className="center-display-unit-wrapper">
            <div className="digital-counters">
                <div className="counter">
                    <span className="value">{String(selectedBar).padStart(2, '0')}</span>
                    <span className="label">BAR</span>
                </div>
                <div className="counter">
                    <span className="value">{String(beatToDisplay).padStart(2, '0')}</span>
                    <span className="label">BEAT</span>
                </div>
            </div>

            <div className="transport-controls-new">
                <button onClick={handlePrevBar}><FaFastBackward /></button>
                <button onClick={handlePrevBeat}><FaStepBackward /></button>
                {/* KEY FIX: The icon now correctly toggles between Play and Pause */}
                <button className={`play-btn ${isPlaying ? 'active' : ''}`} onClick={togglePlay}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className={`record-btn ${isRecording ? 'active' : ''}`} onClick={toggleRecording}><FaCircle /></button>
                <button onClick={handleNextBeat}><FaStepForward /></button>
                <button onClick={handleNextBar}><FaFastForward /></button>
            </div>

            <div className="bpm-controls">
                <div className="bpm-display">{bpm}</div>
                <button className="tap-btn-new" onClick={tap}>TAP</button>
            </div>
        </div>
    );
};

export default CenterDisplayUnit;