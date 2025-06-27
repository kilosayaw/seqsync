import { useState, useCallback, useRef, useEffect } from 'react';
import { Pose, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT } from '@mediapipe/pose';
import { FaceDetection } from '@mediapipe/face_detection';
import { toast } from 'react-toastify';
import { createDefaultBeatObject, POSE_DEFAULT_VECTOR, DEFAULT_NUM_BEATS_PER_BAR_CONST } from '../utils/constants';

// --- Helper Functions ---

// Calculates the angle between three 2D points (in degrees)
const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

// Calculates the apparent 2D distance between two points
const calculateLimbSize = (p1, p2) => {
    if (!p1 || !p2 || p1.visibility < 0.3 || p2.visibility < 0.3) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const useMotionAnalysis = ({ videoRef, bpm, timeSignature, onKeyframeData, logDebug }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    const analysisState = useRef({
      isCancelled: false,
      pose: null,
      faceDetection: null,
      landmarksHistory: [],
    });

    // --- MediaPipe Model Initialization ---
    useEffect(() => {
        analysisState.current.pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
        analysisState.current.pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        
        analysisState.current.faceDetection = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` });
        analysisState.current.faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 });

        return () => {
            analysisState.current.pose?.close();
            analysisState.current.faceDetection?.close();
        };
    }, []);

    const cancelAnalysis = useCallback(() => {
        analysisState.current.isCancelled = true;
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        toast.info("Motion analysis canceled.");
        logDebug('info', '[MotionAnalysis] Analysis canceled by user.');
    }, [logDebug]);

    // --- Main Analysis Logic ---
    const startAnalysis = useCallback(async () => {
        const video = videoRef.current;
        if (!video || isAnalyzing) return;
        if (video.duration <= 0 || isNaN(video.duration)) {
            toast.error("Video not fully loaded or has no duration."); return;
        }

        setIsAnalyzing(true);
        analysisState.current.isCancelled = false;
        analysisState.current.landmarksHistory = [];
        setAnalysisProgress(0);
        toast.info("Starting motion analysis...");

        const musicalBeatsPerBar = timeSignature.beatsPerBar;
        const timePerStep = (60 / bpm) / (DEFAULT_NUM_BEATS_PER_BAR_CONST / musicalBeatsPerBar);
        
        let allFrameData = [];

        // --- Step 1: Extract raw data from each frame ---
        for (let currentTime = 0; currentTime < video.duration; currentTime += timePerStep) {
            if (analysisState.current.isCancelled) break;
            
            video.currentTime = currentTime;
            await new Promise(resolve => video.onseeked = resolve);

            const [poseResults, faceResults] = await Promise.all([
                analysisState.current.pose.send({ image: video }),
                analysisState.current.faceDetection.send({ image: video })
            ]);

            if (poseResults.poseLandmarks) {
                allFrameData.push({
                    time: currentTime,
                    landmarks: poseResults.poseLandmarks,
                    faceDetected: faceResults.detections && faceResults.detections.length > 0,
                });
            }
            setAnalysisProgress((currentTime / video.duration) * 100);
        }

        if (analysisState.current.isCancelled) return;

        // --- Step 2: Process all captured data into POSEQr keyframes ---
        const keyframes = processAllFrames(allFrameData);
        onKeyframeData(keyframes);
        setIsAnalyzing(false);
        setAnalysisProgress(100);

    }, [videoRef, isAnalyzing, bpm, timeSignature, onKeyframeData, logDebug]);

    const processAllFrames = (allFrameData) => {
        let keyframes = {};
        let referenceShoulderWidth = null;

        allFrameData.forEach((frame, index) => {
            const beatData = createDefaultBeatObject(0);
            const { landmarks, faceDetected, time } = frame;

            // --- Temporal Z-Depth Calculation ---
            const currentShoulderWidth = calculateLimbSize(landmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], landmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER]);
            if (referenceShoulderWidth === null && currentShoulderWidth > 0) {
                referenceShoulderWidth = currentShoulderWidth; // Set baseline from first valid frame
            }

            let inferredZ = 0;
            if (referenceShoulderWidth) {
                const sizeRatio = currentShoulderWidth / referenceShoulderWidth;
                const zDirection = faceDetected ? 1 : -1;
                if (sizeRatio > 1.1) inferredZ = zDirection;      // 10% bigger -> closer
                else if (sizeRatio < 0.9) inferredZ = -zDirection; // 10% smaller -> farther
            }

            // --- Joint Processing ---
            const midHip = {
                x: (landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].x + landmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].x) / 2,
                y: (landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].y + landmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].y) / 2,
            };

            const processJoint = (abbrev, landmark) => {
                if (landmark && landmark.visibility > 0.4) {
                    beatData.jointInfo[abbrev] = {
                        vector: {
                            x: (landmark.x - midHip.x) * 2.5,
                            y: -(landmark.y - midHip.y) * 2.0, // Invert Y and adjust scale
                            z: inferredZ,
                            x_base_direction: 0,
                            y_base_direction: 0,
                        },
                        rotation: 0,
                        orientation: 'NEU',
                        intent: 'NONE',
                        energy: 50,
                    };
                }
            };
            
            Object.values(POSE_LANDMARKS_LEFT).forEach(lm => processJoint(`L${lm.name.charAt(5)}`, landmarks[lm]));
            Object.values(POSE_LANDMARKS_RIGHT).forEach(lm => processJoint(`R${lm.name.charAt(6)}`, landmarks[lm]));
            processJoint('H', landmarks[0]); // Nose

            // --- Orientation Heuristics (Example) ---
            const lHip = landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP];
            const lShoulder = landmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER];
            if (lHip && lShoulder && beatData.jointInfo['LH']) {
                beatData.jointInfo['LH'].orientation = (lHip.x < lShoulder.x) ? 'IN' : 'OUT';
            }

            // --- Grounding Heuristics ---
            const lFootY = landmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX]?.y;
            const rFootY = landmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX]?.y;
            if(lFootY && rFootY) {
                const groundPlaneY = Math.max(lFootY, rFootY) + 0.02; // Add tolerance
                if (lFootY > groundPlaneY - 0.05) beatData.grounding.L = ['LF123T12345'];
                if (rFootY > groundPlaneY - 0.05) beatData.grounding.R = ['RF123T12345'];
            }

            keyframes[time] = beatData;
        });

        return keyframes;
    };

    return { isAnalyzing, analysisProgress, startAnalysis, cancelAnalysis };
};