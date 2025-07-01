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
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    const { livePoseData, setLivePoseData } = useMotion();
    useMotionAnalysis(webcamRef, setLivePoseData);

    useEffect(() => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.play() : videoRef.current.pause();
        }
    }, [isPlaying, mediaUrl]);
    
    const shouldShowVideoPlayer = !isLiveFeed && mediaUrl && mediaFile?.type.startsWith('video/');

    return (
        <div className="camera-feed-container">
            {isLiveFeed && !shouldShowVideoPlayer && (
                <>
                    <Webcam ref={webcamRef} audio={false} mirrored={true} className="webcam-video" />
                    {livePoseData && <P5SkeletalVisualizer livePoseData={livePoseData} />}
                </>
            )}
            {shouldShowVideoPlayer && (
                 <video
                    ref={videoRef}
                    key={mediaUrl}
                    className="video-player"
                    controls={false}
                    loop
                    muted // KEY FIX: Mute the video element to prevent double playback.
                    src={mediaUrl}
                />
            )}
            {!isLiveFeed && !shouldShowVideoPlayer && (
                <div className="feed-placeholder"><span>LIVE FEED OFF</span></div>
            )}
        </div>
    );
};

export default CameraFeed;