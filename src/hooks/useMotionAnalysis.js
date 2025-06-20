// client/src/hooks/useMotionAnalysis.js
import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import { UI_PADS_PER_BAR } from '../utils/constants';
// <<< NEW: Import our biomechanics utility >>>
import { calculateZDisplacement } from '../utils/biomechanics'; 

const transformTfPoseToSeqPose = (tfPose, videoElement, previousPose) => {
    if (!tfPose || !tfPose.keypoints) return { jointInfo: {}, grounding: {} };
    const { videoWidth, videoHeight } = videoElement;
    if (videoWidth === 0 || videoHeight === 0) return null;

    const jointInfo = {};
    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE',
        'right_elbow': 'RE', 'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH',
        'right_hip': 'RH', 'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA'
    };

    // <<< NEW: Determine face visibility >>>
    // A simple heuristic: if we can see both eyes (or just the nose), the face is visible.
    const leftEye = tfPose.keypoints.find(k => k.name === 'left_eye');
    const rightEye = tfPose.keypoints.find(k => k.name === 'right_eye');
    const nose = tfPose.keypoints.find(k => k.name === 'nose');
    const isFaceVisible = (leftEye?.score > 0.3 && rightEye?.score > 0.3) || (nose?.score > 0.5);

    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev && keypoint.score > 0.3) {
            // Normalize coordinates. Note: MoveNet's Z is experimental but useful for relative changes.
            const vectorX = (keypoint.x / videoWidth) * 2 - 1;
            const vectorY = (keypoint.y / videoHeight) * -2 + 1;
            const vectorZ = keypoint.z ? (keypoint.z / videoWidth) : 0; // Normalize Z relative to width
            
            jointInfo[abbrev] = {
                vector: { x: Number(vectorX.toFixed(4)), y: Number(vectorY.toFixed(4)), z: Number(vectorZ.toFixed(4)) },
                score: Number(keypoint.score.toFixed(4))
            };
        }
    });

    const currentPoseForComparison = { jointInfo };
    const zDisplacements = calculateZDisplacement(currentPoseForComparison, previousPose, isFaceVisible);

    // <<< NEW: Add the calculated displacement to our final data >>>
    for(const key in jointInfo) {
        jointInfo[key].zDisplacement = zDisplacements[key] || 0;
    }

    const grounding = { L: null, R: null, L_weight: 50 };
    if (jointInfo['LA']?.score > 0.5) grounding.L = 'L123T12345';
    if (jointInfo['RA']?.score > 0.5) grounding.R = 'R123T12345';
    
    return { jointInfo, grounding, isFaceVisible };
};


export const useMotionAnalysis = ({ onPoseUpdate, onAnalysisComplete }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    // ... (rest of the state)
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    const videoRef = useRef(null);
    const rafIdRef = useRef(null);
    const analysisControllerRef = useRef(null);
    // <<< NEW: Keep track of the previous pose for comparison >>>
    const previousPoseRef = useRef(null);

    const callbacksRef = useRef({ onPoseUpdate, onAnalysisComplete });
    useEffect(() => {
        callbacksRef.current.onPoseUpdate = onPoseUpdate;
        callbacksRef.current.onAnalysisComplete = onAnalysisComplete;
    }, [onPoseUpdate, onAnalysisComplete]);

    useEffect(() => {
        // ... (init function remains the same)
        const init = async () => {
            console.log('[MotionAnalysis] Initializing detector...');
            try {
                await tf.ready();
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
                setDetector(await poseDetection.createDetector(model, detectorConfig));
                console.log('[MotionAnalysis] Detector initialized successfully.');
            } catch (err) {
                console.error("Failed to initialize pose detector:", err);
                toast.error('Failed to load analysis engine.');
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, []);

    const estimationLoop = useCallback(async () => {
        if (!detector || !videoRef.current || !document.contains(videoRef.current)) {
            setIsTracking(false);
            return;
        }

        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
        if (poses && poses.length > 0) {
            // <<< MODIFICATION: Pass the previous pose to our transformation function >>>
            const seqPose = transformTfPoseToSeqPose(poses[0], videoRef.current, previousPoseRef.current);
            if (seqPose) {
                setLivePoseData(seqPose);
                previousPoseRef.current = { jointInfo: seqPose.jointInfo }; // Update the previous pose for the next frame
                if (callbacksRef.current.onPoseUpdate) {
                    callbacksRef.current.onPoseUpdate(seqPose);
                }
            }
        }
        
        rafIdRef.current = requestAnimationFrame(estimationLoop);
    }, [detector]);

    useEffect(() => {
        // ... (tracking management effect remains the same)
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
    
    // ... (rest of the hook remains the same)
    const startLiveTracking = useCallback((videoElement) => {
        if (!detector || isInitializing) return;
        if (videoElement && videoElement.videoWidth > 0) {
            console.log('[MotionAnalysis] Starting live tracking.');
            videoRef.current = videoElement;
            setIsTracking(true);
        } else {
            console.error("useMotionAnalysis: startLiveTracking called with invalid video element.");
        }
    }, [detector, isInitializing]);
    
    const stopLiveTracking = useCallback(() => {
        console.log('[MotionAnalysis] Stopping live tracking.');
        setIsTracking(false);
    }, []);
    
    const startFullAnalysis = useCallback(async (videoElement, bpm, timeSignature, totalBars) => {
        // ...
    }, [detector, isAnalyzing]);

    const cancelFullAnalysis = useCallback(() => {
        // ...
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