import React, { forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = forwardRef(({ src, stream, isPlaying, isMirrored }, ref) => {
    
    // This useEffect hook is the core of the fix.
    // It runs whenever the `ref` or the `stream` object changes.
    useEffect(() => {
        // We check if the ref is attached to an element and if a stream exists.
        if (ref.current && stream) {
            // This is the correct way to assign a media stream.
            // We are directly setting the 'srcObject' property on the DOM node.
            ref.current.srcObject = stream;
        }
    }, [ref, stream]);

    const videoStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
    };

    // Note: We remove `srcObject` from the JSX props here.
    // The `useEffect` now handles setting it.
    // The `autoPlay` and `playsInline` props are crucial for live feeds.
    return (
        <video
            ref={ref}
            style={videoStyle}
            src={src || undefined} // This is for pre-recorded video files
            playsInline
            muted 
            autoPlay={!!stream} // We only want to autoplay if it's a live stream
        />
    );
});

VideoMediaPlayer.displayName = 'VideoMediaPlayer'; // Helps with debugging

VideoMediaPlayer.propTypes = {
    src: PropTypes.string,
    stream: PropTypes.object, // The MediaStream object
    isPlaying: PropTypes.bool,
    isMirrored: PropTypes.bool,
};

VideoMediaPlayer.defaultProps = {
    isMirrored: false,
};

export default VideoMediaPlayer;