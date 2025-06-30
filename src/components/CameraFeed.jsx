import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { useMotion } from '../context/MotionContext';
import { useUIState } from '../context/UIStateContext';
import { useMotionAnalysis } from '../hooks/useMotionAnalysis';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import './CameraFeed.css';

const CameraFeed = () => {
    const webcamRef = useRef(null);
    const { livePoseData, setLivePoseData } = useMotion(); // Get BOTH from context
    const { isLiveFeed } = useUIState();
    
    // Call the hook, but it doesn't need to return anything here
    useMotionAnalysis(webcamRef, setLivePoseData);

    return (
        <div className="camera-feed-container">
            {isLiveFeed ? (
                <>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        className="webcam-video"
                    />
                    {livePoseData && (
                        <P5SkeletalVisualizer livePoseData={livePoseData} />
                    )}
                </>
            ) : (
                <div className="feed-placeholder">
                    <span>LIVE FEED OFF</span>
                </div>
            )}
        </div>
    );
};

export default CameraFeed;