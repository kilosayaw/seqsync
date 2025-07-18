import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export const useMotionAnalysis = (videoRef, setLivePoseData) => {
    const [detector, setDetector] = useState(null);
    const animationFrameId = useRef();

    useEffect(() => {
        const initDetector = async () => {
            try {
                // --- DEFINITIVE FIX: Explicitly set the backend and wait for it to be ready ---
                await tf.setBackend('webgl');
                await tf.ready();
                // --- END OF FIX ---

                const model = poseDetection.SupportedModels.BlazePose;
                const detectorConfig = { runtime: 'tfjs', modelType: 'full' };
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                console.log("[useMotionAnalysis] ✅ Pose detector initialized with WebGL backend.");
            } catch (error) {
                console.error("[useMotionAnalysis] ❌ Error initializing pose detector:", error);
            }
        };
        initDetector();
    }, []); // This effect runs only once on mount

    const analyzePose = useCallback(async () => {
        // --- DEFINITIVE FIX: Check the video element directly ---
        // The '.video' property is an implementation detail of WaveSurfer, not a standard video element.
        if (detector && videoRef.current && videoRef.current.readyState >= 3 && typeof setLivePoseData === 'function') {
            const video = videoRef.current;
        // --- END OF FIX ---
            try {
                const poses = await detector.estimatePoses(video, { flipHorizontal: true });
                if (poses && poses.length > 0) {
                    setLivePoseData(poses[0]);
                } else {
                    setLivePoseData(null);
                }
            } catch (error) {
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

    return {};
};