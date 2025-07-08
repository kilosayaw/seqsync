// src/hooks/useMotionAnalysis.js

import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export const useMotionAnalysis = (videoRef, setLivePoseData) => {
    const [detector, setDetector] = useState(null);
    const animationFrameId = useRef();

    useEffect(() => {
        const initDetector = async () => {
            try {
                const model = poseDetection.SupportedModels.BlazePose;
                const detectorConfig = { runtime: 'tfjs', modelType: 'full' };
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                console.log("[useMotionAnalysis] ✅ Pose detector initialized.");
            } catch (error) {
                console.error("[useMotionAnalysis] ❌ Error initializing pose detector:", error);
            }
        };
        initDetector();
    }, []);

    const analyzePose = useCallback(async () => {
        if (detector && videoRef.current?.video?.readyState === 4 && typeof setLivePoseData === 'function') {
            const video = videoRef.current.video;
            try {
                const poses = await detector.estimatePoses(video, { flipHorizontal: true });
                if (poses && poses.length > 0) {
                    setLivePoseData(poses[0]);
                } else {
                    setLivePoseData(null);
                }
            } catch (error) {
                // This can be noisy, so it's often commented out during development
                // console.error("[useMotionAnalysis] ❌ Error estimating pose:", error);
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

    return {}; // This hook doesn't need to return anything directly
};