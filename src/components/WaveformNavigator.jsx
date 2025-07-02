import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../context/MediaContext';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const { wavesurferRef } = useMedia();
    const { setSelectedBar, setSelectedBeat } = useUIState();
    const { bpm, togglePlay } = usePlayback();

    useEffect(() => {
        if (!waveformRef.current) return;
        if (!wavesurferRef.current) {
             const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: 'rgba(200, 200, 200, 0.5)',
                progressColor: 'rgba(0, 255, 170, 1)',
                barWidth: 3,
                barGap: 2,
                barRadius: 2,
                height: 80,
                cursorWidth: 2,
                cursorColor: '#fff',
            });
            wavesurferRef.current = wavesurfer;

            wavesurfer.on('interaction', (newTime) => {
                console.log(`[Waveform] User interaction, seeking to ${newTime.toFixed(3)}s`);
                wavesurfer.setTime(newTime);
                
                const beatsPerSecond = bpm / 60;
                const totalSixteenths = Math.floor(newTime * beatsPerSecond * 4);
                const newBar = Math.floor(totalSixteenths / 16) + 1;
                const newBeatInBar = totalSixteenths % 16;
                
                setSelectedBar(newBar);
                setSelectedBeat(newBeatInBar);
            });

             wavesurfer.on('play', () => {
                console.log('[Waveform] Play event triggered.');
            });

        }
    }, [wavesurferRef, bpm, setSelectedBar, setSelectedBeat, togglePlay]);

    return <div ref={waveformRef} className="waveform-navigator-container"></div>;
};

export default WaveformNavigator;