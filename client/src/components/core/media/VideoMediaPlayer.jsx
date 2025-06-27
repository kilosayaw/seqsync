// src/components/core/media/VideoMediaPlayer.jsx
import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = forwardRef(({ mediaSrc, mediaStream, isPlaying }, ref) => {
  const videoRef = useRef(null);

  // Expose the video element itself via the ref for advanced operations
  React.useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (mediaStream) {
      videoElement.srcObject = mediaStream;
      videoElement.src = ''; // Clear src to ensure stream is used
      videoElement.muted = true; // <-- BUG FIX: Mute live streams to allow autoplay
      videoElement.play().catch(e => console.error("Error playing media stream:", e));
    } else if (mediaSrc) {
      videoElement.srcObject = null;
      videoElement.src = mediaSrc;
      videoElement.muted = false; // Allow user to control volume for loaded files
    } else {
      videoElement.srcObject = null;
      videoElement.src = '';
    }
  }, [mediaSrc, mediaStream]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || mediaStream) return; // Don't control playback for live stream

    if (isPlaying && videoElement.paused) {
      videoElement.play().catch(e => console.error("Error playing video:", e));
    } else if (!isPlaying && !videoElement.paused) {
      videoElement.pause();
    }
  }, [isPlaying, mediaStream]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain"
      controls={!mediaStream}
      loop={false}
      playsInline // Important for mobile compatibility
    />
  );
});

VideoMediaPlayer.displayName = 'VideoMediaPlayer';

VideoMediaPlayer.propTypes = {
  mediaSrc: PropTypes.string,
  mediaStream: PropTypes.object,
  isPlaying: PropTypes.bool.isRequired,
};

export default VideoMediaPlayer;