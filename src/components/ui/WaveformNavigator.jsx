// src/components/ui/WaveformNavigator.jsx
import React, { useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';

const WaveformNavigator = () => {
    const { waveformContainerRef, wavesurferInstance } = useMedia();

    useEffect(() => {
        const ws = wavesurferInstance;
        if (ws) {
            const handleClickToSeek = (progress) => {
                const targetTime = progress * ws.getDuration();
                console.log(`[Waveform] Clicked to seek. Progress: ${progress.toFixed(2)}, Time: ${targetTime.toFixed(3)}s`);
                ws.setTime(targetTime);
            };
            ws.on('interaction', handleClickToSeek);
            return () => { ws.un('interaction', handleClickToSeek); };
        }
    }, [wavesurferInstance]);

    return (
        <div className="waveform-navigator-container">
            <div ref={waveformContainerRef} className="waveform" />
        </div>
    );
};
export default WaveformNavigator;