// src/components/ui/WaveformNavigator.jsx
import React, { useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { formatTime } from '../../utils/notationUtils';

const WaveformNavigator = () => {
    const { waveformContainerRef, wavesurferInstance } = useMedia();

    useEffect(() => {
        const ws = wavesurferInstance;
        if (ws) {
            const handleClick = (progress, e) => {
                // Check if the click event originated from a user interaction
                if (e) {
                    const duration = ws.getDuration();
                    const clickedTime = progress * duration;
                    console.log(
                        `[Waveform] User clicked at ${formatTime(clickedTime)} ` +
                        `(${(progress * 100).toFixed(2)}%)`
                    );
                }
                ws.setTime(progress * ws.getDuration());
            };
            ws.on('interaction', handleClick);

            return () => {
                ws.un('interaction', handleClick);
            };
        }
    }, [wavesurferInstance]);

    return (
        <div className="waveform-navigator-container">
            <div ref={waveformContainerRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;