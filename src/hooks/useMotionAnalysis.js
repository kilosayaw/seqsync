// src/hooks/useMotionAnalysis.js (Final, Robust Version)
import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

// Use a singleton pattern to ensure the detector is created only once.
let detectorPromise = null;

const initializeDetector = async () => {
    if (!detectorPromise) {
        console.log("[useMotionAnalysis] Initializing PoseNet detector...");
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
            runtime: 'tfjs',
            modelType: 'full', // 'lite', 'full', or 'heavy'
        };
        detectorPromise = poseDetection.createDetector(model, detectorConfig);
    }
    return detectorPromise;
};

export const useMotionAnalysis = (videoRef, onPoseDetected) => {
    const animationFrameId = useRef();

    const analyzePose = useCallback(async () => {
        try {
            const detector = await initializeDetector();
            const video = videoRef.current;

            if (detector && video && video.readyState === 4 && onPoseDetected) {
                const poses = await detector.estimatePoses(video, {
                    flipHorizontal: false // We flip with CSS for a better experience
                });
                if (poses && poses.length > 0) {
                    onPoseDetected(poses[0]); // Send the detected pose data up
                } else {
                    onPoseDetected(null);
                }
            }
        } catch (error) {
            console.error("Error in pose analysis loop:", error);
        }
        
        animationFrameId.current = requestAnimationFrame(analyzePose);

    }, [videoRef, onPoseDetected]);

    useEffect(() => {
        // Start the analysis loop
        animationFrameId.current = requestAnimationFrame(analyzePose);

        // Cleanup function to stop the loop when the component unmounts
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [analyzePose]);
};