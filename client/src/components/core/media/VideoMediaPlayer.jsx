import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = forwardRef(({ mediaSrc, mediaStream, isPlaying }, ref) => {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (mediaStream) {
      videoElement.srcObject = mediaStream;
      videoElement.src = null;
      videoElement.muted = true;
      videoElement.play().catch(e => console.error("Error playing media stream:", e));
    } else if (mediaSrc) {
      videoElement.srcObject = null;
      videoElement.src = mediaSrc;
      videoElement.muted = false;
    }
  }, [mediaSrc, mediaStream]);

  // Sync video playback state with sequencer's master state
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
      controls={!mediaStream} // Hide controls for live camera feed
      loop={false}
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