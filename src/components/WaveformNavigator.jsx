import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const { mediaUrl, duration } = useMedia();
    const { bpm, setCurrentBeat } = usePlayback();
    const { setSelectedBar } = useUIState();

    useEffect(() => {
        if (!waveformRef.current || !mediaUrl) return;

        // Destroy previous instance if it exists
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'rgba(200, 200, 200, 0.5)',
            progressColor: 'rgba(0, 255, 170, 1)',
            barWidth: 3,
            barGap: 2,
            barRadius: 2,
            url: mediaUrl,
            height: 80,
            cursorWidth: 2,
            cursorColor: '#fff',
        });
        wavesurferRef.current = wavesurfer;

        // When user clicks the waveform, seek our application's state
        wavesurfer.on('interaction', (newTime) => {
            const beatDuration = 60 / bpm;
            const stepDuration = beatDuration / 4; // 16th notes
            const totalStep = Math.floor(newTime / stepDuration);
            
            const bar = Math.floor(totalStep / 16) + 1;
            const beatInBar = totalStep % 16;
            
            console.log(`[WaveformNav] Clicked. Seeking to Bar ${bar}, Beat ${beatInBar}`);
            setSelectedBar(bar);
            setCurrentBeat(beatInBar);
        });

        // Cleanup on unmount
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, [mediaUrl, bpm, setCurrentBeat, setSelectedBar]);

    return <div ref={waveformRef} className="waveform-navigator-container"></div>;
};

export default WaveformNavigator;