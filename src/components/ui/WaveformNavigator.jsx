import React, { useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
// We no longer need to import usePlayback here.

const WaveformNavigator = () => {
    // Its ONLY jobs are to get the ref and instance from the MediaContext.
    const { waveformContainerRef, wavesurferInstance } = useMedia();

    // This effect now only handles the click interaction.
    useEffect(() => {
        const ws = wavesurferInstance;
        if (ws) {
            const handleClick = (progress) => {
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
            {/* The ref is attached here, but the instance is created in the context. */}
            <div ref={waveformContainerRef} className="waveform" />
        </div>
    );
};

export default WaveformNavigator;