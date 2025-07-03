import React, { useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    // Get the ref and instance from the one true source: PlaybackContext
    const { waveformRef, wavesurfer, bpm, isEngineReady } = usePlayback();
    const { setSelectedBar, setSelectedBeat } = useUIState();

    useEffect(() => {
        // Only attach interaction listeners if the REAL engine is ready
        if (!isEngineReady || !wavesurfer) return;

        const handleInteraction = (newTime) => {
            console.log(`[Waveform] User interaction, seeking to ${newTime.toFixed(3)}s`);
            wavesurfer.setTime(newTime);
            
            const totalSixteenths = Math.floor(newTime * (bpm / 60) * 4);
            const newBar = Math.floor(totalSixteenths / 16) + 1;
            const newBeatInBar = totalSixteenths % 16;
            
            setSelectedBar(newBar);
            setSelectedBeat(newBeatInBar);
        };

        wavesurfer.on('interaction', handleInteraction);
        return () => {
            if (wavesurfer) {
                wavesurfer.un('interaction', handleInteraction);
            }
        };
    }, [isEngineReady, wavesurfer, bpm, setSelectedBar, setSelectedBeat]);

    // This component's only job is to provide the div for WaveSurfer to attach to.
    return <div ref={waveformRef} className="waveform-navigator-container"></div>;
};

export default WaveformNavigator;