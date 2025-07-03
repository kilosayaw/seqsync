import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    // Get the ref from the one true source: PlaybackContext.
    const { waveformRef } = usePlayback();

    // This component's only job is to provide the div for WaveSurfer to attach to.
    return <div ref={waveformRef} className="waveform-navigator-container"></div>;
};

export default WaveformNavigator;