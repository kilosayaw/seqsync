// client/src/hooks/useMotionAnalysis.js
import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import { UI_PADS_PER_BAR } from '../utils/constants';

const transformTfPoseToSeqPose = (tfPose, videoElement) => {
    if (!tfPose || !tfPose.keypoints) return { jointInfo: {}, grounding: {} };
    const { videoWidth, videoHeight } = videoElement;
    if (videoWidth === 0 || videoHeight === 0) return null; // Prevent division by zero

    const jointInfo = {};
    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE',
        'right_elbow': 'RE', 'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH',
        'right_hip': 'RH', 'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA'
    };
    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev && keypoint.score > 0.3) {
            const vectorX = (keypoint.x / videoWidth) * 2 - 1;
            const vectorY = (keypoint.y / videoHeight) * -2 + 1;
            jointInfo[abbrev] = {
                vector: { x: Number(vectorX.toFixed(4)), y: Number(vectorY.toFixed(4)), z: 0 },
                score: Number(keypoint.score.toFixed(4))
            };
        }
    });
    const grounding = { L: null, R: null, L_weight: 50 };
    if (jointInfo['LA']?.score > 0.5) grounding.L = 'L123T12345';
    if (jointInfo['RA']?.score > 0.5) grounding.R = 'R123T12345';
    return { jointInfo, grounding };
};

export const useMotionAnalysis = ({ onPoseUpdate, onAnalysisComplete }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    const videoRef = useRef(null);
    const rafIdRef = useRef(null);
    const analysisControllerRef = useRef(null);

    // --- DEFINITIVE FIX for Infinite Loop ---
    // Store callbacks in a ref to ensure the animation loop has a stable reference.
    const callbacksRef = useRef({ onPoseUpdate, onAnalysisComplete });
    useEffect(() => {
        callbacksRef.current.onPoseUpdate = onPoseUpdate;
        callbacksRef.current.onAnalysisComplete = onAnalysisComplete;
    }, [onPoseUpdate, onAnalysisComplete]);

    // Initialize Detector once on mount
    useEffect(() => {
        const init = async () => {
            try {
                await tf.ready();
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
                setDetector(await poseDetection.createDetector(model, detectorConfig));
            } catch (err) {
                console.error("Failed to initialize pose detector:", err);
                toast.error('Failed to load analysis engine.');
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, []);

    // The core animation loop. This function is now stable.
    const estimationLoop = useCallback(async () => {
        if (!detector || !videoRef.current || !document.contains(videoRef.current)) {
            setIsTracking(false); // Stop tracking if conditions fail
            return;
        }

        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
        if (poses && poses.length > 0) {
            const seqPose = transformTfPoseToSeqPose(poses[0], videoRef.current);
            if (seqPose) { // Only update if transformation was successful
                setLivePoseData(seqPose);
                if (callbacksRef.current.onPoseUpdate) {
                    callbacksRef.current.onPoseUpdate(seqPose);
                }
            }
        }
        
        // Schedule the next frame
        rafIdRef.current = requestAnimationFrame(estimationLoop);
    }, [detector]);

    // This effect manages the starting and stopping of the animation loop
    useEffect(() => {
        if (isTracking) {
            rafIdRef.current = requestAnimationFrame(estimationLoop);
        } else {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
        // Cleanup function to stop the loop if the hook unmounts
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isTracking, estimationLoop]);
    
    const startLiveTracking = useCallback((videoElement) => {
        if (!detector || isInitializing) return;
        if (videoElement && videoElement.videoWidth > 0) {
            videoRef.current = videoElement;
            setIsTracking(true);
        } else {
            console.error("useMotionAnalysis: startLiveTracking called with invalid video element.");
        }
    }, [detector, isInitializing]);
    
    const stopLiveTracking = useCallback(() => {
        setIsTracking(false);
    }, []);

    const startFullAnalysis = useCallback(async (videoElement, bpm, timeSignature, totalBars) => {
        if (isAnalyzing || !detector) return;
        
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        analysisControllerRef.current = new AbortController();
        const { signal } = analysisControllerRef.current;
        const results = [];
        const totalSteps = totalBars * UI_PADS_PER_BAR;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / (timeSignature.beatsPerBar || 4));
        const originalVideoTime = videoElement.currentTime;
        videoElement.pause();

        toast.info(`Starting analysis for ${totalSteps} beats...`);

        try {
            for (let i = 0; i < totalSteps; i++) {
                if (signal.aborted) {
                    toast.warn("Analysis cancelled.");
                    break;
                }
                const timeTarget = i * timePerStep;
                if (timeTarget > videoElement.duration) break;

                videoElement.currentTime = timeTarget;
                await new Promise(resolve => { videoElement.onseeked = resolve; });

                const poses = await detector.estimatePoses(videoElement, { flipHorizontal: false });
                if (poses && poses.length > 0) {
                    const poseData = transformTfPoseToSeqPose(poses[0], videoElement);
                    if (poseData) {
                        results.push({
                            bar: Math.floor(i / UI_PADS_PER_BAR),
                            beat: i % UI_PADS_PER_BAR,
                            poseData
                        });
                    }
                }
                setAnalysisProgress(((i + 1) / totalSteps) * 100);
            }
            if (!signal.aborted && callbacksRef.current.onAnalysisComplete) {
                callbacksRef.current.onAnalysisComplete(results);
            }
        } catch (err) {
            toast.error("An error occurred during analysis.");
            console.error("Full analysis error:", err);
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(0);
            videoElement.currentTime = originalVideoTime;
            analysisControllerRef.current = null;
        }
    }, [detector, isAnalyzing]);

    const cancelFullAnalysis = useCallback(() => {
        if (analysisControllerRef.current) {
            analysisControllerRef.current.abort();
        }
    }, []);

    return {
        isInitializing,
        isTracking,
        isAnalyzing,
        analysisProgress,
        livePoseData,
        startLiveTracking,
        stopLiveTracking,
        startFullAnalysis,
        cancelFullAnalysis,
    };
};