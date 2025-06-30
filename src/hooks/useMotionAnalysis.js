import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

// The setter from context is passed in here
export const useMotionAnalysis = (videoRef, setLivePoseData) => {
    const [detector, setDetector] = useState(null);
    const animationFrameId = useRef();

    useEffect(() => {
        const initDetector = async () => {
            try {
                const model = poseDetection.SupportedModels.BlazePose;
                const detectorConfig = {
                    runtime: 'tfjs',
                    modelType: 'full',
                };
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                console.log("Pose detector initialized.");
            } catch (error) {
                console.error("Error initializing pose detector:", error);
            }
        };
        initDetector();
    }, []);

    const analyzePose = useCallback(async () => {
        // Check if setLivePoseData is actually a function before using it
        if (detector && videoRef.current && videoRef.current.video && typeof setLivePoseData === 'function') {
            const video = videoRef.current.video;
            if (video.readyState === 4) {
                try {
                    const poses = await detector.estimatePoses(video, {
                        flipHorizontal: true,
                    });
                    if (poses && poses.length > 0) {
                        setLivePoseData(poses[0]);
                    } else {
                        setLivePoseData(null);
                    }
                } catch (error) {
                    console.error("Error estimating pose:", error);
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(analyzePose);
    }, [detector, videoRef, setLivePoseData]);

    useEffect(() => {
        if (detector && videoRef.current) {
            animationFrameId.current = requestAnimationFrame(analyzePose);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [detector, videoRef, analyzePose]);
    
    // This hook doesn't return anything directly; it works via the context setter.
    return {}; 
};