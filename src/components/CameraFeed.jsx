import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useUIState } from '../context/UIStateContext';
import { useMedia } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';
import { useMotionAnalysis } from '../hooks/useMotionAnalysis';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import './CameraFeed.css';

const CameraFeed = () => {
    const { isLiveFeed } = useUIState();
    const { mediaUrl, mediaFile } = useMedia();
    const { isPlaying, wavesurfer } = usePlayback(); // Get the wavesurfer instance
    
    const webcamRef = useRef(null);
    const videoRef = useRef(null); // Ref for the <video> element
    
    useMotionAnalysis(webcamRef); // Hook for live webcam analysis

    // This effect syncs the <video> element with the WaveSurfer audio.
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !wavesurfer) return;

        const syncVideo = () => {
            console.log('[CameraFeed] Syncing video time to audio time.');
            videoElement.currentTime = wavesurfer.getCurrentTime();
        };

        const onPlay = () => videoElement.play();
        const onPause = () => videoElement.pause();
        const onSeek = () => syncVideo();

        // Attach listeners
        wavesurfer.on('play', onPlay);
        wavesurfer.on('pause', onPause);
        wavesurfer.on('seek', onSeek);
        
        // Initial sync
        if (isPlaying) {
            syncVideo();
            onPlay();
        }

        // Cleanup
        return () => {
            wavesurfer.un('play', onPlay);
            wavesurfer.un('pause', onPause);
            wavesurfer.un('seek', onSeek);
        };

    }, [wavesurfer, isPlaying]); // Re-run when the wavesurfer instance changes

    const shouldShowVideoPlayer = mediaUrl && mediaFile?.type.startsWith('video/');

    return (
        <div className="camera-feed-container">
            {isLiveFeed && !shouldShowVideoPlayer ? (
                <>
                    <Webcam ref={webcamRef} audio={false} mirrored={true} className="webcam-video" />
                    {/* <P5SkeletalVisualizer ... /> */}
                </>
            ) : shouldShowVideoPlayer ? (
                 <video
                    ref={videoRef}
                    key={mediaUrl} // Force re-render on new file
                    className="video-player"
                    src={mediaUrl}
                    muted // Audio is handled by WaveSurfer, so the video MUST be muted.
                    loop={false}
                />
            ) : (
                <div className="feed-off-message">LIVE FEED OFF</div>
            )}
        </div>
    );
};

export default CameraFeed;