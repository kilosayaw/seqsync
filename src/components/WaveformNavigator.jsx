import React, { useRef, useEffect, useContext } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { MediaContext } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const { setWavesurferInstance } = useContext(MediaContext);
    const { seekToTime } = usePlayback();
    
    // --- CORE FIX: Part 1 ---
    // Create a ref to hold the latest version of the seekToTime function.
    // This ref itself is stable and will not cause re-renders.
    const seekToTimeRef = useRef(seekToTime);

    // This small effect ensures our ref always has the most recent seekToTime function
    // without triggering other, more expensive effects.
    useEffect(() => {
        seekToTimeRef.current = seekToTime;
    }, [seekToTime]);


    // --- CORE FIX: Part 2 ---
    // This effect now ONLY depends on the stable setWavesurferInstance function.
    // It will run exactly once on component mount, breaking the infinite loop.
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

            // The event listener now calls the function via the stable ref.
            // This ensures it always uses the latest logic without being a dependency.
            ws.on('seeking', (timeInSeconds) => {
                seekToTimeRef.current(timeInSeconds);
            });
            
            return () => {
                ws.destroy();
            };
        }
    }, [setWavesurferInstance]); // Dependency array is now stable.

    return (
        <div className="waveform-navigator">
            <div ref={waveformRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;