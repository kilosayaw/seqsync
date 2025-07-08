// src/components/ui/CameraFeed.jsx
import React, { useRef, useEffect } from 'react';
import { useMotion } from '../../context/MotionContext';
import { useMotionAnalysis } from '../../hooks/useMotionAnalysis';
import './CameraFeed.css';

const CameraFeed = () => {
    const videoRef = useRef(null);
    const { setLivePoseData } = useMotion();
    
    // This hook will automatically handle starting the pose analysis
    useMotionAnalysis(videoRef, setLivePoseData);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                // We could show an error message to the user here
            }
        };
        startCamera();

        // Cleanup function to stop the camera stream when the component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <video 
            ref={videoRef} 
            className="camera-feed-video" 
            autoPlay 
            playsInline 
            muted
        />
    );
};

export default CameraFeed;