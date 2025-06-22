import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { useMedia } from './MediaContext';
import { usePlayback } from './PlaybackContext';
import { analyzePoseDynamics } from '../utils/biomechanics';

const MotionAnalysisContext = createContext(null);

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


export const MotionAnalysisProvider = ({ children }) => {
    const [detector, setDetector] = useState(null);
    const [livePose, setLivePose] = useState(null);
    const [liveAnalysis, setLiveAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState(null);

    const animationFrameId = useRef(null);
    const previousPoseRef = useRef(null);
    const { videoRef } = useMedia();
    const { updateLivePose } = usePlayback();

    useEffect(() => {
        const loadModel = async () => {
            setIsInitializing(true);
            try {
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
            } catch (err) {
                console.error("Failed to load MoveNet model", err);
                setError("Failed to load AI model. Please check your connection and refresh.");
            } finally {
                setIsInitializing(false);
            }
        };
        loadModel();
    }, []);

    const estimationLoop = useCallback(async () => {
        if (detector && videoRef.current && videoRef.current.readyState >= 3) {
            const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
            if (poses && poses.length > 0) {
                const currentPose = transformTfPoseToSeqPose(poses[0], videoRef.current);
                if (currentPose) {
                    const analysisResult = analyzePoseDynamics(currentPose, previousPoseRef.current);
                    const fullPoseData = { ...currentPose, analysis: analysisResult };
                    
                    setLivePose(fullPoseData);
                    setLiveAnalysis(analysisResult);
                    updateLivePose(fullPoseData);
                    
                    previousPoseRef.current = currentPose;
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(estimationLoop);
    }, [detector, videoRef, updateLivePose]);

    const startAnalysis = useCallback(() => {
        if (isAnalyzing || !detector) return;
        setIsAnalyzing(true);
        animationFrameId.current = requestAnimationFrame(estimationLoop);
    }, [isAnalyzing, detector, estimationLoop]);

    const stopAnalysis = useCallback(() => {
        if (!isAnalyzing) return;
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        setIsAnalyzing(false);
        setLivePose(null);
        setLiveAnalysis(null);
        previousPoseRef.current = null;
    }, [isAnalyzing]);

    const value = {
        livePose,
        liveAnalysis,
        isAnalyzing, // FIX: Added this back to the value object
        isInitializing,
        error,
        startAnalysis,
        stopAnalysis,
    };

    return (
        <MotionAnalysisContext.Provider value={value}>
            {children}
        </MotionAnalysisContext.Provider>
    );
};

export const useMotionAnalysisContext = () => {
    const context = useContext(MotionAnalysisContext);
    if (!context) throw new Error('useMotionAnalysisContext must be used within a MotionAnalysisProvider');
    return context;
};