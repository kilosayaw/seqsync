import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import { UI_PADS_PER_BAR } from '../utils/constants';
import { calculateZDisplacement } from '../utils/biomechanics';

const v_sub = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const v_mag = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const v_dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
const v_angle = (v1, v2) => {
    const mag1 = v_mag(v1);
    const mag2 = v_mag(v2);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosTheta = v_dot(v1, v2) / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);
};

// This is the upgraded data transformation pipeline.
const transformTfPoseToSeqPose = (tfPose, videoElement, previousPose) => {
    if (!tfPose || !tfPose.keypoints) return null;
    const { videoWidth, videoHeight } = videoElement;
    if (videoWidth === 0 || videoHeight === 0) return null;

    const jointInfo = {};
    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE',
        'right_elbow': 'RE', 'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH',
        'right_hip': 'RH', 'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA'
    };

    const nose = tfPose.keypoints.find(k => k.name === 'nose');
    const isFaceVisible = nose?.score > 0.5;

    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev && keypoint.score > 0.3) {
            const currentVector = {
                x: (keypoint.x / videoWidth) * 2 - 1,
                y: (keypoint.y / videoHeight) * -2 + 1,
                z: keypoint.z ? (keypoint.z / videoWidth) * -1 : 0,
            };
            jointInfo[abbrev] = {
                vector: { x: Number(currentVector.x.toFixed(4)), y: Number(currentVector.y.toFixed(4)), z: Number(currentVector.z.toFixed(4)) },
                score: Number(keypoint.score.toFixed(4)),
            };
        }
    });

    const currentPoseForComparison = { jointInfo };
    const zDisplacements = calculateZDisplacement(currentPoseForComparison, previousPose, isFaceVisible);

    for (const key in jointInfo) {
        if(jointInfo[key]) jointInfo[key].zDisplacement = zDisplacements[key] || 0;
    }
    
    // --- NEW: Flexion/Extension & Rotation Logic ---
    const getFlexionState = (p1, p2, p3) => {
        if (!p1?.vector || !p2?.vector || !p3?.vector) return 'NEU';
        const v1 = v_sub(p1.vector, p2.vector);
        const v2 = v_sub(p3.vector, p2.vector);
        const angle = v_angle(v1, v2);
        if (angle < 140) return 'FLEX';
        if (angle > 165) return 'EXT';
        return 'NEU';
    };

    const getShoulderRotation = (shoulder, elbow, wrist) => {
        if (!shoulder?.vector || !elbow?.vector || !wrist?.vector) return 'NEU';
        const shoulderToWrist = v_sub(wrist.vector, shoulder.vector);
        const shoulderToElbow = v_sub(elbow.vector, shoulder.vector);
        const crossZ = shoulderToWrist.x * shoulderToElbow.y - shoulderToWrist.y * shoulderToElbow.x;
        if (crossZ > 0.05) return 'IN';
        if (crossZ < -0.05) return 'OUT';
        return 'NEU';
    };

    if (jointInfo.LS && jointInfo.LE && jointInfo.LW) {
        jointInfo.LE.orientation = getFlexionState(jointInfo.LS, jointInfo.LE, jointInfo.LW);
        jointInfo.LS.orientation = getShoulderRotation(jointInfo.LS, jointInfo.LE, jointInfo.LW);
    }
    if (jointInfo.RS && jointInfo.RE && jointInfo.RW) {
        jointInfo.RE.orientation = getFlexionState(jointInfo.RS, jointInfo.RE, jointInfo.RW);
        jointInfo.RS.orientation = getShoulderRotation(jointInfo.RS, jointInfo.RE, jointInfo.RW);
    }
    if (jointInfo.LH && jointInfo.LK && jointInfo.LA) {
        jointInfo.LK.orientation = getFlexionState(jointInfo.LH, jointInfo.LK, jointInfo.LA);
    }
    if (jointInfo.RH && jointInfo.RK && jointInfo.RA) {
        jointInfo.RK.orientation = getFlexionState(jointInfo.RH, jointInfo.RK, jointInfo.RA);
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    const videoRef = useRef(null);
    const rafIdRef = useRef(null);
    const analysisControllerRef = useRef(null);
    const previousPoseRef = useRef(null);

    const callbacksRef = useRef({ onPoseUpdate, onAnalysisComplete });
    useEffect(() => {
        callbacksRef.current.onPoseUpdate = onPoseUpdate;
        callbacksRef.current.onAnalysisComplete = onAnalysisComplete;
    }, [onPoseUpdate, onAnalysisComplete]);

    useEffect(() => {
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
        if (!detector || !videoRef.current || !document.contains(videoRef.current)) { /* ... */ return; }
        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
        if (poses && poses.length > 0) {
            const seqPose = transformTfPoseToSeqPose(poses[0], videoRef.current, previousPoseRef.current);
            if (seqPose) {
                setLivePoseData(seqPose);
                previousPoseRef.current = { jointInfo: seqPose.jointInfo };
                if (callbacksRef.current.onPoseUpdate) {
                    callbacksRef.current.onPoseUpdate(seqPose);
                }
            }
        }
        rafIdRef.current = requestAnimationFrame(estimationLoop);
    }, [detector]);


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
        isInitializing, isTracking, isAnalyzing, analysisProgress, livePoseData,
        startLiveTracking, stopLiveTracking, startFullAnalysis, cancelFullAnalysis,
    };
};