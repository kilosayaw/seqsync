import React, { useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../../context/MediaContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const { setWavesurferInstance } = useMedia();

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
                height: 60, // The internal height of the waveform
                normalize: true,
            });
            setWavesurferInstance(ws);
            
            // Note: We removed the seek logic from here as it should be handled
            // by the PlaybackContext to avoid circular dependencies.

            return () => { ws.destroy(); };
        }
    }, [setWavesurferInstance]);

    return (
        <div className="waveform-navigator-container">
            <div ref={waveformRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;