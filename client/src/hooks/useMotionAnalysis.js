import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';

// [FIXED] Corrected the import path from './constants' to '../utils/constants'
import { POSE_DEFAULT_VECTOR, DEFAULT_JOINT_ENERGY, DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT } from '../utils/constants';

// Mapping from MediaPipe's landmark indices to our internal POSEQr joint abbreviations.
const MEDIAPIPE_TO_POSEQR_MAP = {
  [POSE_LANDMARKS.LEFT_SHOULDER]: 'LS',
  [POSE_LANDMARKS.RIGHT_SHOULDER]: 'RS',
  [POSE_LANDMARKS.LEFT_ELBOW]: 'LE',
  [POSE_LANDMARKS.RIGHT_ELBOW]: 'RE',
  [POSE_LANDMARKS.LEFT_WRIST]: 'LW',
  [POSE_LANDMARKS.RIGHT_WRIST]: 'RW',
  [POSE_LANDMARKS.LEFT_HIP]: 'LH',
  [POSE_LANDMARKS.RIGHT_HIP]: 'RH',
  [POSE_LANDMARKS.LEFT_KNEE]: 'LK',
  [POSE_LANDMARKS.RIGHT_KNEE]: 'RK',
  [POSE_LANDMARKS.LEFT_ANKLE]: 'LA',
  [POSE_LANDMARKS.RIGHT_ANKLE]: 'RA',
  [POSE_LANDMARKS.LEFT_FOOT_INDEX]: 'LF',
  [POSE_LANDMARKS.RIGHT_FOOT_INDEX]: 'RF',
  [POSE_LANDMARKS.NOSE]: 'H',
  // Note: MediaPipe doesn't have a distinct "Neck" or "Chest" point.
  // These would need to be interpolated if required. For now, we map what we can.
};


/**
 * Converts raw MediaPipe landmarks into a POSEQr pose data structure.
 * This is the core translation engine of the motion analysis.
 * @param {object[]} landmarks - The array of landmark objects from MediaPipe.
 * @returns {object} A POSEQr-compliant pose data object.
 */
const landmarksToPoseQr = (landmarks) => {
  if (!landmarks || landmarks.length === 0) {
    return { jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 } };
  }

  const poseQrData = {
    jointInfo: {},
    grounding: { L: null, R: null, L_weight: 50 }
  };

  // 1. Establish a stable reference frame for the pose.
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

  if (!leftHip || !rightHip || !leftShoulder || !rightShoulder) {
    return poseQrData; // Not enough data to create a stable frame.
  }

  // Center of Mass (CoM) approximation: Midpoint of the hips.
  const comX = (leftHip.x + rightHip.x) / 2;
  const comY = (leftHip.y + rightHip.y) / 2;

  // Scale factor: Use the distance between shoulders to normalize vectors.
  const shoulderDist = Math.sqrt(Math.pow(leftShoulder.x - rightShoulder.x, 2) + Math.pow(leftShoulder.y - rightShoulder.y, 2));
  const scale = shoulderDist > 0.01 ? shoulderDist : 1; // Avoid division by zero.

  // 2. Iterate through all mappable landmarks and convert them to POSEQr joint data.
  for (const [mpIndex, jointAbbrev] of Object.entries(MEDIAPIPE_TO_POSEQR_MAP)) {
    const landmark = landmarks[mpIndex];
    if (!landmark) continue;

    // Calculate the vector relative to the CoM and normalize it.
    // X-axis: MediaPipe's X is left-to-right (0 to 1). Our system needs to be consistent. Let's make right negative, left positive.
    const vecX = (landmark.x - comX) / scale;
    // Y-axis: MediaPipe's Y is top-to-bottom (0 to 1). We invert it so that up is positive.
    const vecY = -(landmark.y - comY) / scale;
    // Z-axis: MediaPipe's Z is depth (closer is more negative). We can use this directly. Visibility is a confidence score.
    const vecZ = landmark.z / scale; 

    poseQrData.jointInfo[jointAbbrev] = {
      vector: { x: vecX, y: vecY, z: vecZ, x_base_direction: 0, y_base_direction: 0 },
      rotation: 0, // Rotation needs a more complex calculation (e.g., from segment angles), default to 0.
      extension: 0, // Extension also needs segment angle calculations, default to 0.
      energy: DEFAULT_JOINT_ENERGY,
      orientation: DEFAULT_GENERAL_ORIENTATION,
      intent: DEFAULT_INTENT,
    };
  }

  // 3. Basic grounding inference. (This is a simplified heuristic).
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  // A simple heuristic: the foot with the higher Y value (lower on screen) is likely grounded.
  if (leftAnkle && rightAnkle) {
    if (leftAnkle.y > rightAnkle.y && leftAnkle.visibility > 0.7) {
      poseQrData.grounding.L = ['LF123T12345']; // Assume full plant
    } else if (rightAnkle.y > leftAnkle.y && rightAnkle.visibility > 0.7) {
      poseQrData.grounding.R = ['RF123T12345']; // Assume full plant
    }
  }

  return poseQrData;
};

/**
 * A custom hook to manage the state and logic for video motion analysis.
 * @param {{videoRef: React.RefObject, bpm: number, timeSignature: object, onKeyframeData: Function, logDebug: Function}} props
 */
export const useMotionAnalysis = ({ videoRef, bpm, timeSignature, onKeyframeData, logDebug }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const isCancelledRef = useRef(false);
  const poseEstimatorRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const thumbnailCanvasRef = useRef(null);

  // Initialize the thumbnail canvas once.
  useEffect(() => {
    thumbnailCanvasRef.current = document.createElement('canvas');
  }, []);

  const captureThumbnail = useCallback((videoElement) => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas || !videoElement) return null;
    // Set canvas dimensions to a small, fixed size for performance.
    canvas.width = 128;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
  }, []);

  const initializePoseEstimator = useCallback(async () => {
    logDebug('info', '[MotionAnalysis] Initializing Pose Estimator...');
    try {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      await pose.initialize();
      poseEstimatorRef.current = pose;
      logDebug('info', '[MotionAnalysis] Pose Estimator Initialized.');
      return pose;
    } catch (error) {
      logDebug('error', '[MotionAnalysis] Failed to initialize MediaPipe Pose.', error);
      toast.error('Failed to load motion analysis model.');
      return null;
    }
  }, [logDebug]);

  const cancelAnalysis = useCallback(() => {
    isCancelledRef.current = true;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    logDebug('warn', '[MotionAnalysis] Analysis cancellation requested.');
  }, [logDebug]);

  const startAnalysis = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement || videoElement.readyState < 2) {
      toast.error("Video is not loaded or ready for analysis.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    isCancelledRef.current = false;
    toast.info("Starting motion analysis...");

    try {
      const pose = poseEstimatorRef.current || await initializePoseEstimator();
      if (!pose) return;

      const keyframes = [];
      const duration = videoElement.duration;
      const musicalBeatsPerBar = timeSignature.beatsPerBar || 4;
      const stepsPerBar = 16;
      const timePerStep = (60 / bpm) / (stepsPerBar / musicalBeatsPerBar);
      
      if (duration <= 0 || !isFinite(duration) || timePerStep <= 0 || !isFinite(timePerStep)) {
        throw new Error("Invalid video duration or timing parameters.");
      }

      const totalSteps = Math.floor(duration / timePerStep);
      logDebug('info', `[MotionAnalysis] Starting loop. Total steps: ${totalSteps}, Time/Step: ${timePerStep.toFixed(3)}s`);

      for (let i = 0; i < totalSteps; i++) {
        if (isCancelledRef.current) {
          logDebug('warn', '[MotionAnalysis] Analysis loop cancelled.');
          toast.warn("Motion analysis cancelled.");
          break;
        }

        const currentTime = i * timePerStep;
        videoElement.currentTime = currentTime;

        // Wait for the video to seek to the correct time.
        await new Promise(resolve => {
          const seekedHandler = () => {
            videoElement.removeEventListener('seeked', seekedHandler);
            resolve();
          };
          videoElement.addEventListener('seeked', seekedHandler);
        });
        
        // Run pose detection on the current frame.
        await pose.send({ image: videoElement });
        
        const results = await new Promise(resolve => {
            pose.onResults(r => resolve(r));
        });

        if (results.poseLandmarks) {
          const poseData = landmarksToPoseQr(results.poseLandmarks);
          const thumbnail = captureThumbnail(videoElement);

          const bar = Math.floor(i / stepsPerBar);
          const beat = i % stepsPerBar;
          
          keyframes.push({ bar, beat, poseData, thumbnail });
        }
        
        setAnalysisProgress(((i + 1) / totalSteps) * 100);
      }
      
      if (!isCancelledRef.current) {
        onKeyframeData(keyframes);
      }

    } catch (error) {
      logDebug('error', '[MotionAnalysis] An error occurred during analysis.', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100); // Or 0 if cancelled, for clarity
    }
  }, [videoRef, bpm, timeSignature, onKeyframeData, logDebug, initializePoseEstimator, captureThumbnail]);

  return { isAnalyzing, analysisProgress, startAnalysis, cancelAnalysis };
};