import React, { useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { usePadMapping } from '../hooks/usePadMapping';
import { formatTime } from '../utils/formatTime';
import { FaPlay, FaPause, FaCircle, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward } from 'react-icons/fa';
import './CenterDisplayUnit.css';

const CenterDisplayUnit = () => {
    const { isPlaying, isRecording, togglePlay, toggleRecording, bpm, setBpm, currentTime, seekToTime } = usePlayback();
    const { selectedBar, setSelectedBar, selectedBeat, setSelectedBeat } = useUIState();
    const { totalBars, barStartTimes } = useSequence();
    const { seekToPad } = usePadMapping();
    
    const { tap } = useTapTempo((newBpm) => {
        console.log(`[Control] TAP registered. New BPM: ${newBpm}`);
        setBpm(newBpm);
    });
    
    const beatsPerSecond = bpm / 60;
    const totalSixteenths = Math.floor(currentTime * beatsPerSecond * 4);
    const liveBeat = totalSixteenths % 16;

    useEffect(() => {
        if (selectedBeat !== null) {
            seekToPad(selectedBeat, selectedBar);
        }
    }, [selectedBeat, selectedBar, seekToPad]);


    const handlePrevBar = () => {
        const newBar = Math.max(1, selectedBar - 1);
        if (newBar !== selectedBar) {
            console.log(`[Navigation] Previous Bar clicked. Seeking to Bar ${newBar}`);
            setSelectedBar(newBar);
            seekToTime(barStartTimes[newBar - 1] || 0);
        }
    };

    const handleNextBar = () => {
        const newBar = Math.min(totalBars || 1, selectedBar + 1);
        if (newBar !== selectedBar && newBar <= barStartTimes.length) {
            console.log(`[Navigation] Next Bar clicked. Seeking to Bar ${newBar}`);
            setSelectedBar(newBar);
            seekToTime(barStartTimes[newBar - 1] || 0);
        }
    };

    const handlePrevBeat = () => {
        const currentSelection = selectedBeat === null ? liveBeat : selectedBeat;
        let newBeat = currentSelection - 1;
        if (newBeat < 0) {
            if (selectedBar > 1) {
                const newBar = selectedBar - 1;
                console.log(`[Navigation] Beat wrap-around to previous bar. New bar: ${newBar}`);
                setSelectedBar(newBar);
                newBeat = 15; 
            } else { newBeat = 0; }
        }
        console.log(`[Navigation] Previous Beat clicked. New beat selection: ${newBeat + 1}`);
        setSelectedBeat(newBeat);
    };

    const handleNextBeat = () => {
        const currentSelection = selectedBeat === null ? liveBeat : selectedBeat;
        let newBeat = currentSelection + 1;
        if (newBeat > 15) {
            if (selectedBar < totalBars) {
                const newBar = selectedBar + 1;
                console.log(`[Navigation] Beat wrap-around to next bar. New bar: ${newBar}`);
                setSelectedBar(newBar);
                newBeat = 0;
            } else { newBeat = 15; }
        }
        console.log(`[Navigation] Next Beat clicked. New beat selection: ${newBeat + 1}`);
        setSelectedBeat(newBeat);
    };

    const handleTogglePlay = () => {
        console.log(`[Control] Play/Pause toggled. Was playing: ${isPlaying}`);
        togglePlay();
    };

    const handleToggleRecording = () => {
        console.log(`[Control] Record toggled. Was recording: ${isRecording}`);
        toggleRecording();
    };

    const beatToDisplay = isPlaying ? liveBeat + 1 : (selectedBeat !== null ? selectedBeat + 1 : 0);

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

            <div className="master-clock-display">
                {formatTime(currentTime)}
            </div>

            {/* === RESTORED VISUAL STRUCTURE === */}
            <div className="transport-controls-new">
                <button onClick={handlePrevBar}><FaFastBackward /></button>
                <button onClick={handlePrevBeat}><FaStepBackward /></button>
                <button className={`play-btn ${isPlaying ? 'active' : ''}`} onClick={handleTogglePlay}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className={`record-btn ${isRecording ? 'active' : ''}`} onClick={handleToggleRecording}><FaCircle /></button>
                <button onClick={handleNextBeat}><FaStepForward /></button>
                <button onClick={handleNextBar}><FaFastForward /></button>
            </div>

            <div className="bpm-controls">
                <div className="bpm-display">{bpm}</div>
                <button className="tap-btn-new" onClick={tap}>TAP</button>
            </div>
            {/* === END RESTORED STRUCTURE === */}
        </div>
    );
};

export default CenterDisplayUnit;