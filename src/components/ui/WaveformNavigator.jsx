// src/components/ui/WaveformNavigator.jsx

import React, { useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';

const WaveformNavigator = () => {
    // Its ONLY job is to get the ref and instance from the MediaContext.
    const { waveformContainerRef, wavesurferInstance } = useMedia();

    // This effect handles the user clicking on the waveform to seek.
    // It is separate from the 'audioprocess' event which is handled in the PlaybackContext.
    useEffect(() => {
        const ws = wavesurferInstance;
        if (ws) {
            const handleClickToSeek = (progress) => {
                // The 'interaction' event is a consolidated event for clicks.
                // We set the time directly on the instance.
                ws.setTime(progress * ws.getDuration());
            };
            
            ws.on('interaction', handleClickToSeek);

            return () => {
                // Clean up the event listener when the component unmounts.
                ws.un('interaction', handleClickToSeek);
            };
        }
    }, [wavesurferInstance]);

    return (
        <div className="waveform-navigator-container">
            {/* The ref is attached here, but the instance is created and managed in MediaContext. */}
            <div ref={waveformContainerRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;