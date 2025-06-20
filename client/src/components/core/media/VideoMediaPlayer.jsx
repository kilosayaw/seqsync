import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = forwardRef(({ mediaUrl, mediaStream, isPlaying, onReady }, ref) => {
  const videoRef = useRef(null);

  React.useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // --- Event Handler Definitions ---
    const handleCanPlay = () => {
      if (onReady && videoElement.videoWidth > 0) onReady(videoElement);
    };

    const handleLoadedMetadata = () => {
      // For live streams, we must call play() here to ensure autoplay works.
      if (mediaStream) {
        videoElement.play().catch(e => console.error("Autoplay interrupted or failed:", e));
      }
    };
    
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    // --- DEFINITIVE FIX: Refactored Source Management ---
    // Only perform actions if a valid source exists.
    if (mediaStream) {
      if (videoElement.srcObject !== mediaStream) {
        videoElement.srcObject = mediaStream;
      }
      videoElement.src = ''; // Clear file source if stream is active
      videoElement.muted = true;
      videoElement.controls = false;
    } else if (mediaUrl) {
      if (videoElement.src !== mediaUrl) {
        videoElement.src = mediaUrl;
      }
      videoElement.srcObject = null; // Clear stream source if file is active
      videoElement.muted = false;
      videoElement.controls = true; // Show controls for video files
    } else {
      // If no source, clear both and do nothing else.
      videoElement.srcObject = null;
      videoElement.src = '';
    }

    // --- Playback Control for Files (only if a URL is set) ---
    if (mediaUrl) {
      if (isPlaying && videoElement.paused) {
        videoElement.play().catch(e => console.error("Error playing video file:", e));
      } else if (!isPlaying && !videoElement.paused) {
        videoElement.pause();
      }
    }

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [mediaUrl, mediaStream, isPlaying, onReady]);

  return (
    <video
      key={mediaStream?.id || mediaUrl}
      ref={videoRef}
      className="w-full h-full object-contain"
      loop={false}
      playsInline
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