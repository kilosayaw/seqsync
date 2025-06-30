import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useMotion } from '../context/MotionContext';
import { useUIState } from '../context/UIStateContext';
import { useMedia } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';
import { useMotionAnalysis } from '../hooks/useMotionAnalysis';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import './CameraFeed.css';

const CameraFeed = () => {
    const { isLiveFeed } = useUIState();
    const { mediaUrl, mediaFile } = useMedia();
    const { isPlaying } = usePlayback();
    
    // We now need two separate refs: one for the live webcam, one for the video player
    const webcamRef = useRef(null);
    const videoRef = useRef(null);

    // Get the data and setters from our motion context
    const { livePoseData, setLivePoseData } = useMotion();
    
    // KEY FIX: The motion analysis hook is now being called correctly.
    // It's attached to the webcam's ref and will update the global MotionContext.
    useMotionAnalysis(webcamRef, setLivePoseData);

    // This logic correctly handles playing/pausing the loaded video file
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, mediaUrl]); // Also re-run if the mediaUrl changes
    
    const shouldShowVideoPlayer = !isLiveFeed && mediaUrl && mediaFile?.type.startsWith('video/');

    return (
        <div className="camera-feed-container">
            {/* Condition 1: If "Live" is on AND we are not showing a video file */}
            {isLiveFeed && !shouldShowVideoPlayer && (
                <>
                    {/* KEY FIX: The Webcam component was missing and is now restored */}
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        className="webcam-video"
                    />
                    {/* The skeletal overlay is tied to the live feed */}
                    {livePoseData && (
                        <P5SkeletalVisualizer livePoseData={livePoseData} />
                    )}
                </>
            )}

            {/* Condition 2: If "Live" is off AND a video file is loaded */}
            {shouldShowVideoPlayer && (
                 <video
                    ref={videoRef}
                    key={mediaUrl} // Force re-render on new file
                    className="video-player"
                    controls={false}
                    loop // Loop the video for continuous playback
                    muted // Mute by default to avoid issues, audio is handled by Web Audio API
                    src={mediaUrl}
                />
            )}

            {/* Condition 3: Fallback if Live is off and there's no video to play */}
            {!isLiveFeed && !shouldShowVideoPlayer && (
                <div className="feed-placeholder">
                    <span>LIVE FEED OFF</span>
                </div>
            )}
        </div>
    );
};

export default CameraFeed;