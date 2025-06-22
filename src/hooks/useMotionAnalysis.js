import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';

// --- FIX: Import the main analysis function, NOT individual pieces ---
import { analyzePoseDynamics } from '../utils/biomechanics';

// Helper to transform TensorFlow's pose object into our app's format
const transformTfPoseToSeqPose = (tfPose, videoElement) => {
    if (!tfPose || !tfPose.keypoints) return null;
    const { videoWidth, videoHeight } = videoElement;
    if (videoWidth === 0 || videoHeight === 0) return null;

    const jointInfo = {};
    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE',
        'right_elbow': 'RE', 'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH',
        'right_hip': 'RH', 'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA'
    };

    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev && keypoint.score > 0.3) {
            jointInfo[abbrev] = {
                vector: {
                    x: Number(((keypoint.x / videoWidth) * 2 - 1).toFixed(4)),
                    y: Number(((keypoint.y / videoHeight) * -2 + 1).toFixed(4)),
                    z: Number((keypoint.z ? (keypoint.z / videoWidth) * -1 : 0).toFixed(4)),
                },
                score: Number(keypoint.score.toFixed(4)),
            };
        }
    });

    const grounding = { L: null, R: null, L_weight: 50, R_weight: 50 };
    if (jointInfo['LA']?.score > 0.5) grounding.L = 'L_FULL_PLANT';
    if (jointInfo['RA']?.score > 0.5) grounding.R = 'R_FULL_PLANT';
    
    return { jointInfo, grounding };
};


export const useMotionAnalysis = ({ onPoseUpdate }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    
    const rafIdRef = useRef(null);
    const previousPoseRef = useRef(null);

    // This ref ensures we always have the latest callback function without re-triggering effects
    const callbacksRef = useRef({ onPoseUpdate });
    useEffect(() => {
        callbacksRef.current.onPoseUpdate = onPoseUpdate;
    }, [onPoseUpdate]);

    useEffect(() => {
        const init = async () => {
            setIsInitializing(true);
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

    const estimationLoop = useCallback(async (videoElement) => {
        if (!detector || !videoElement || !document.contains(videoElement) || videoElement.readyState < 3) {
             rafIdRef.current = requestAnimationFrame(() => estimationLoop(videoElement));
             return;
        }

        const poses = await detector.estimatePoses(videoElement, { flipHorizontal: false });
        if (poses && poses.length > 0) {
            const currentPose = transformTfPoseToSeqPose(poses[0], videoElement);
            if (currentPose) {
                // --- FIX: Use the single, correct analysis function ---
                const analysisResult = analyzePoseDynamics(currentPose, previousPoseRef.current);
                
                const fullPoseData = { ...currentPose, analysis: analysisResult };
                
                setLivePoseData(fullPoseData);
                
                if (callbacksRef.current.onPoseUpdate) {
                    callbacksRef.current.onPoseUpdate(fullPoseData);
                }
                
                previousPoseRef.current = currentPose;
            }
        }
        rafIdRef.current = requestAnimationFrame(() => estimationLoop(videoElement));
    }, [detector]);

    const startLiveTracking = useCallback((videoElement) => {
        if (!detector || isInitializing) return;
        if (videoElement && videoElement.videoWidth > 0) {
            setIsTracking(true);
            rafIdRef.current = requestAnimationFrame(() => estimationLoop(videoElement));
        } else {
            console.error("useMotionAnalysis: startLiveTracking called with invalid video element.");
        }
    }, [detector, isInitializing, estimationLoop]);
    
    const stopLiveTracking = useCallback(() => {
        setIsTracking(false);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        setLivePoseData(null);
        previousPoseRef.current = null;
    }, []);


    useEffect(() => {
        if (isTracking) {
            console.log('[MotionAnalysis] Starting estimation loop.');
            rafIdRef.current = requestAnimationFrame(estimationLoop);
        } else {
            if (rafIdRef.current) {
                console.log('[MotionAnalysis] Stopping estimation loop.');
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isTracking, estimationLoop]);
    

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
                    const poseData = transformTfPoseToSeqPose(poses[0], videoElement, previousPoseRef.current);
                    if (poseData) {
                        results.push({
                            bar: Math.floor(i / UI_PADS_PER_BAR),
                            beat: i % UI_PADS_PER_BAR,
                            poseData
                        });
                        previousPoseRef.current = { jointInfo: poseData.jointInfo };
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
        livePoseData,
        startLiveTracking,
        stopLiveTracking,
    };
};