// /client/src/hooks/useMotionAnalysis.js
import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import { transformTfPoseToSeqPose } from '../utils/thumbnailUtils.js';

// This hook now takes the mirror state as a direct argument
export const useMotionAnalysis = ({ onPoseUpdate, isOverlayMirrored }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    
    const videoRef = useRef(null);
    const rafIdRef = useRef(null);

    // Initialize the model once
    useEffect(() => {
        const init = async () => {
            if (detector) return;
            try {
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, modelUrl: '/models/movenet/model.json' };
                setDetector(await poseDetection.createDetector(model, detectorConfig));
                toast.success('Analysis engine loaded.');
            } catch (err) {
                toast.error('Failed to load analysis engine.');
                console.error("Fatal: Failed to initialize pose detector:", err);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [detector]);

    // The main animation loop for real-time tracking
    const estimationLoop = useCallback(async () => {
        if (!isTracking || !detector || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            setIsTracking(false);
            return;
        }
        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
        if (poses?.[0]) {
            const seqPose = transformTfPoseToSeqPose(poses[0], videoRef.current, isOverlayMirrored);
            setLivePoseData(seqPose);
            if (onPoseUpdate) onPoseUpdate(seqPose);
        }
        rafIdRef.current = requestAnimationFrame(estimationLoop);
    }, [isTracking, detector, isOverlayMirrored, onPoseUpdate]);
    
    useEffect(() => {
        if (isTracking) {
            rafIdRef.current = requestAnimationFrame(estimationLoop);
        }
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isTracking, estimationLoop]);
    
    const startLiveTracking = useCallback((videoElement) => {
        if (detector && videoElement) {
            videoRef.current = videoElement;
            setIsTracking(true);
        }
    }, [detector]);
    
    const stopLiveTracking = useCallback(() => {
        setIsTracking(false);
    }, []);

    // We will handle the full analysis logic separately to keep this hook focused.
    
    return { isInitializing, livePoseData, startLiveTracking, stopLiveTracking };
};