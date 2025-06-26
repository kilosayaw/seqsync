import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // Registers the WebGL backend
import { toast } from 'react-toastify';

// Helper to transform TensorFlow.js pose output into our poSĒQr™ data structure
const transformTfPoseToSeqPose = (tfPose, videoElement) => {
    if (!tfPose || !tfPose.keypoints) return { jointInfo: {}, grounding: {} };

    const { videoWidth, videoHeight } = videoElement;
    const jointInfo = {};

    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS',
        'left_elbow': 'LE', 'right_elbow': 'RE', 'left_wrist': 'LW',
        'right_wrist': 'RW', 'left_hip': 'LH', 'right_hip': 'RH',
        'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA',
        'right_ankle': 'RA'
    };

    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev) {
            // Normalize coordinates to a -1 to 1 range
            const vectorX = (keypoint.x / videoWidth) * 2 - 1;
            const vectorY = (keypoint.y / videoHeight) * -2 + 1; // Invert Y-axis
            jointInfo[abbrev] = {
                vector: {
                    x: Number(vectorX.toFixed(4)),
                    y: Number(vectorY.toFixed(4)),
                    z: 0 // Z-depth is not provided by MoveNet
                },
                score: Number(keypoint.score.toFixed(4))
            };
        }
    });

    // A more robust placeholder for grounding logic
    const leftAnkle = jointInfo['LA'];
    const rightAnkle = jointInfo['RA'];
    const grounding = { L: null, R: null, L_weight: 50 };
    if (leftAnkle?.score > 0.5) grounding.L = 'L123'; // Assume full plant if visible
    if (rightAnkle?.score > 0.5) grounding.R = 'R123'; // Assume full plant if visible

    return { jointInfo, grounding };
};

export const useMotionAnalysis = ({ onPoseUpdate, onAnalysisComplete }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [error, setError] = useState(null);
    const rafIdRef = useRef(null);
    const analysisControllerRef = useRef(null);

    // Initialize the pose detector model once on component mount
    useEffect(() => {
        const init = async () => {
            try {
                await tf.ready();
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                toast.success('Motion analysis engine ready.');
            } catch (err) {
                console.error("Failed to initialize pose detector:", err);
                toast.error('Failed to load analysis engine.');
                setError(err.message);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, []);
    
    // --- CORRECTED FUNCTION ORDER AND STRUCTURE ---

    const stopLiveTracking = useCallback(() => {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        setIsTracking(false);
    }, []);

    const startLiveTracking = useCallback(async (videoElement) => {
        if (!detector || isInitializing) {
            toast.warn("Motion analysis engine not ready.");
            return;
        }
        stopLiveTracking(); // Ensure any previous loop is stopped
        setIsTracking(true);

        const estimationLoop = async () => {
            // Check if tracking should continue
            if (!videoElement || videoElement.paused || videoElement.ended || !document.contains(videoElement)) {
                stopLiveTracking();
                return;
            }
            
            try {
                const poses = await detector.estimatePoses(videoElement, { flipHorizontal: false });
                if (poses && poses.length > 0) {
                    const seqPose = transformTfPoseToSeqPose(poses[0], videoElement);
                    setLivePoseData(seqPose); // Update the state with the latest pose
                    if (onPoseUpdate) onPoseUpdate(seqPose); // Optional callback for parent
                }
            } catch (err) {
                console.error("Error during pose estimation loop:", err);
                stopLiveTracking(); // Stop on error
            }
            
            rafIdRef.current = requestAnimationFrame(estimationLoop);
        };
        estimationLoop();

    }, [detector, isInitializing, onPoseUpdate, stopLiveTracking]);


    const startFullAnalysis = useCallback(async (videoElement, bpm, timeSignature, totalBars, padsPerBar) => {
        if (isAnalyzing) {
            toast.warn("Analysis is already in progress.");
            return;
        }
        if (!detector || !videoElement) {
            toast.error("Analysis engine or video not ready.");
            return;
        }
        
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        analysisControllerRef.current = new AbortController();
        const { signal } = analysisControllerRef.current;

        const results = [];
        const totalSteps = totalBars * padsPerBar;
        const timePerStep = (60 / bpm) / (padsPerBar / timeSignature.beatsPerBar);
        const originalVideoTime = videoElement.currentTime;
        videoElement.pause();

        try {
            for (let i = 0; i < totalSteps; i++) {
                if (signal.aborted) {
                    toast.warn("Analysis cancelled by user.");
                    break;
                }
                const timeTarget = i * timePerStep;
                if (timeTarget > videoElement.duration) break;

                videoElement.currentTime = timeTarget;
                await new Promise(resolve => {
                    const onSeeked = () => {
                        videoElement.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    videoElement.addEventListener('seeked', onSeeked);
                });

                const poses = await detector.estimatePoses(videoElement, { flipHorizontal: false });
                if (poses && poses.length > 0) {
                    const poseData = transformTfPoseToSeqPose(poses[0], videoElement);
                    results.push({
                        bar: Math.floor(i / padsPerBar),
                        beat: i % padsPerBar,
                        poseData
                    });
                }
                setAnalysisProgress(((i + 1) / totalSteps) * 100);
            }

            if (!signal.aborted && onAnalysisComplete) {
                onAnalysisComplete(results);
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
    }, [detector, isAnalyzing, onAnalysisComplete]);

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
        error,
        livePoseData,
        startLiveTracking,
        stopLiveTracking,
        startFullAnalysis,
        cancelFullAnalysis,
    };
};