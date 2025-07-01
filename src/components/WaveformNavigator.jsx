import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../context/MediaContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    // Get the master ref from the context
    const { wavesurferRef, mediaUrl } = useMedia();

    // This effect is responsible for CREATING the WaveSurfer instance once.
    useEffect(() => {
        if (!waveformRef.current) return;

        // Only create a new instance if one doesn't exist
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
                // We don't provide a URL on creation anymore
            });
            wavesurferRef.current = wavesurfer;

            // When the user clicks or scrubs the waveform, seek to that position and play.
            wavesurfer.on('interaction', (newTime) => {
                wavesurfer.setTime(newTime);
                wavesurfer.play();
            });
        }
        
        // Cleanup on component unmount
        return () => {
            // The instance itself should persist, but we can clean up listeners if needed.
            // For now, we let the instance live for the duration of the app session.
        };
    }, [wavesurferRef]);


    return <div ref={waveformRef} className="waveform-navigator-container"></div>;
};

export default WaveformNavigator;