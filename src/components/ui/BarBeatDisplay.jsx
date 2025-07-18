import React from 'react';
import PropTypes from 'prop-types';
import DigitalDisplay from './DigitalDisplay.jsx';
import { formatTime } from '../../utils/notationUtils.js';
import './BarBeatDisplay.css';

const BarBeatDisplay = (props) => {
    const {
        currentTime, isPlaying, playingBar, playingBeat,
        selectedBar, activePad, stepsPerBar
    } = props;

    const displayBar = isPlaying ? playingBar : selectedBar;
    const beatInBar = isPlaying ? playingBeat : (activePad !== null ? activePad % stepsPerBar : 0);
    const displayBeat = beatInBar + 1;

    return (
        <div className="bar-beat-display-container">
            <DigitalDisplay label="BAR" value={String(displayBar).padStart(2, '0')} />
            <DigitalDisplay label="TIME" value={formatTime(currentTime)} className="time-display" />
            <DigitalDisplay label="BEAT" value={String(displayBeat).padStart(2, '0')} />
        </div>
    );
};

BarBeatDisplay.propTypes = {
    currentTime: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    playingBar: PropTypes.number.isRequired,
    playingBeat: PropTypes.number.isRequired,
    selectedBar: PropTypes.number.isRequired,
    activePad: PropTypes.number.isRequired,
    stepsPerBar: PropTypes.number.isRequired,
};

export default React.memo(BarBeatDisplay);