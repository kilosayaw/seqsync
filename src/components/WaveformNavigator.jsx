import React, { useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../context/MediaContext'; // CORRECTED
import { usePlayback } from '../context/PlaybackContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const { setWavesurferInstance } = useMedia(); // CORRECTED
    const { seekToTime } = usePlayback();
    const seekToTimeRef = useRef(seekToTime);

    useEffect(() => {
        seekToTimeRef.current = seekToTime;
    }, [seekToTime]);

    useEffect(() => {
        if (waveformRef.current) {
            const ws = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#637381',
                progressColor: '#00ab55',
                cursorColor: '#ffffff',
                barWidth: 3,
                barRadius: 3,
                responsive: true,
                height: 80,
                normalize: true,
            });
            setWavesurferInstance(ws);
            ws.on('seeking', (timeInSeconds) => {
                seekToTimeRef.current(timeInSeconds);
            });
            return () => { ws.destroy(); };
        }
    }, [setWavesurferInstance]);

    return (
        <div className="waveform-navigator">
            <div ref={waveformRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;