import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = forwardRef(({ src, stream, isPlaying }, ref) => {
    const internalRef = useRef(null);
    React.useImperativeHandle(ref, () => internalRef.current);

    useEffect(() => {
        const videoElement = internalRef.current;
        if (!videoElement) return;

        if (stream) {
            // Live stream is active
            if (videoElement.src) videoElement.pause(); // Pause the underlying video file if it exists
            videoElement.srcObject = stream;
            videoElement.muted = true;
            videoElement.play().catch(e => console.error("Live cam autoplay failed:", e));
        } else if (src) {
            // File is active
            videoElement.srcObject = null;
            videoElement.src = src;
            videoElement.muted = false;
        } else {
            // No media at all
            videoElement.srcObject = null;
            videoElement.src = '';
        }
    }, [src, stream]);

    // This effect now ONLY controls playback for file-based media
    useEffect(() => {
        const videoElement = internalRef.current;
        if (videoElement && src && !stream) { // Only control if src exists AND stream is not active
            if (isPlaying && videoElement.paused) {
                videoElement.play().catch(e => console.error("Error playing video file:", e));
            } else if (!isPlaying && !videoElement.paused) {
                videoElement.pause();
            }
        }
    }, [isPlaying, src, stream]);

    return (
        <video
            ref={internalRef}
            className="w-full h-full object-contain"
            playsInline
            controls={!!src && !stream} // Show controls only for loaded video when live cam is off
        />
    );
});

VideoMediaPlayer.displayName = 'VideoMediaPlayer';

VideoMediaPlayer.propTypes = {
  mediaUrl: PropTypes.string,
  mediaStream: PropTypes.object,
  isPlaying: PropTypes.bool.isRequired,
  onReady: PropTypes.func,
};

export default VideoMediaPlayer;