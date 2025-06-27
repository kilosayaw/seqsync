import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import { POSE_DEFAULT_VECTOR, DEFAULT_JOINT_ENERGY, DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT } from '../utils/constants';

const MEDIAPIPE_TO_POSEQR_MAP = {
  [POSE_LANDMARKS.LEFT_SHOULDER]: 'LS', [POSE_LANDMARKS.RIGHT_SHOULDER]: 'RS',
  [POSE_LANDMARKS.LEFT_ELBOW]: 'LE', [POSE_LANDMARKS.RIGHT_ELBOW]: 'RE',
  [POSE_LANDMARKS.LEFT_WRIST]: 'LW', [POSE_LANDMARKS.RIGHT_WRIST]: 'RW',
  [POSE_LANDMARKS.LEFT_HIP]: 'LH', [POSE_LANDMARKS.RIGHT_HIP]: 'RH',
  [POSE_LANDMARKS.LEFT_KNEE]: 'LK', [POSE_LANDMARKS.RIGHT_KNEE]: 'RK',
  [POSE_LANDMARKS.LEFT_ANKLE]: 'LA', [POSE_LANDMARKS.RIGHT_ANKLE]: 'RA',
  [POSE_LANDMARKS.LEFT_FOOT_INDEX]: 'LF', [POSE_LANDMARKS.RIGHT_FOOT_INDEX]: 'RF',
  [POSE_LANDMARKS.NOSE]: 'H',
};

const landmarksToPoseQr = (landmarks) => {
  if (!landmarks || landmarks.length === 0) return { jointInfo: {}, grounding: {} };
  const poseQrData = { jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 } };
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  if (!leftHip || !rightHip) return poseQrData;
  const comX = (leftHip.x + rightHip.x) / 2;
  const comY = (leftHip.y + rightHip.y) / 2;
  const shoulderDist = Math.sqrt(Math.pow((landmarks[POSE_LANDMARKS.LEFT_SHOULDER]?.x || 0) - (landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]?.x || 0), 2));
  const scale = shoulderDist > 0.01 ? shoulderDist : 1;

  for (const [mpIndex, jointAbbrev] of Object.entries(MEDIAPIPE_TO_POSEQR_MAP)) {
    const landmark = landmarks[mpIndex];
    if (!landmark) continue;
    const vecX = (landmark.x - comX) / scale;
    const vecY = -(landmark.y - comY) / scale;
    const vecZ = landmark.z / scale;
    poseQrData.jointInfo[jointAbbrev] = { vector: { x: vecX, y: vecY, z: vecZ }, rotation: 0, extension: 0, energy: DEFAULT_JOINT_ENERGY, orientation: DEFAULT_GENERAL_ORIENTATION, intent: DEFAULT_INTENT };
  }
  return poseQrData;
};

export const useMotionAnalysis = ({ onPoseUpdate, onKeyframeData, logDebug }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const isCancelledRef = useRef(false);
  const poseEstimatorRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const thumbnailCanvasRef = useRef(null);

  useEffect(() => { thumbnailCanvasRef.current = document.createElement('canvas'); }, []);

  const captureThumbnail = useCallback((videoElement) => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas || !videoElement) return null;
    canvas.width = 128;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, []);

  const initializePoseEstimator = useCallback(async () => {
    if (poseEstimatorRef.current) return poseEstimatorRef.current;
    logDebug('info', '[MotionAnalysis] Initializing Pose Estimator...');
    try {
      const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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

  const startLiveTracking = useCallback(async (videoElement) => {
    const pose = await initializePoseEstimator();
    if (!pose || !videoElement) return;
    isCancelledRef.current = false;
    pose.onResults(results => {
      if (results.poseLandmarks && onPoseUpdate) {
        const poseQr = landmarksToPoseQr(results.poseLandmarks);
        onPoseUpdate(poseQr.jointInfo);
      }
    });
    const onFrame = async () => {
      if (videoElement.paused || videoElement.ended || isCancelledRef.current) {
        stopLiveTracking();
        return;
      }
      await pose.send({ image: videoElement });
      animationFrameIdRef.current = requestAnimationFrame(onFrame);
    };
    animationFrameIdRef.current = requestAnimationFrame(onFrame);
  }, [initializePoseEstimator, onPoseUpdate]);

  const stopLiveTracking = useCallback(() => {
    isCancelledRef.current = true;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const startAnalysis = useCallback(async (videoElement, bpm, timeSignature, captureResolution) => {
    if (!videoElement || videoElement.readyState < 2) {
      toast.error("Video is not ready for analysis.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    isCancelledRef.current = false;
    toast.info(`Starting full analysis at 1/${captureResolution} note resolution...`);
    const pose = await initializePoseEstimator();
    if (!pose) {
      setIsAnalyzing(false);
      return;
    }
    const keyframes = [];
    const duration = videoElement.duration;
    const beatsPerBar = timeSignature.beatsPerBar || 4;
    const stepsPerBar = 16;
    const timePerBeat = 60 / bpm;
    const timePerStep = timePerBeat * (beatsPerBar / captureResolution);

    if (duration <= 0 || !isFinite(duration) || timePerStep <= 0 || !isFinite(timePerStep)) {
        toast.error("Invalid video duration or timing parameters for analysis.");
        setIsAnalyzing(false);
        return;
    }
    const totalStepsToAnalyze = Math.floor(duration / timePerStep);
    logDebug('info', `[Analysis] Total steps to analyze: ${totalStepsToAnalyze}`);
    const originalVideoTime = videoElement.currentTime;
    videoElement.pause();

    // Use a separate onResults handler for the batch process
    const processResults = (results) => {
        if (results.poseLandmarks) {
            const poseData = landmarksToPoseQr(results.poseLandmarks);
            const thumbnail = captureThumbnail(videoElement);
            poseData.thumbnail = thumbnail;
            keyframes.push({ poseData }); // Temporarily store poseData
        }
    };
    pose.onResults(processResults);

    for (let i = 0; i < totalStepsToAnalyze; i++) {
        if (isCancelledRef.current) {
            logDebug('warn', '[Analysis] Loop cancelled by user.');
            toast.warn("Motion analysis cancelled.");
            break;
        }
        const currentTime = i * timePerStep;
        videoElement.currentTime = currentTime;
        await new Promise(resolve => {
            const seekedHandler = () => {
                videoElement.removeEventListener('seeked', seekedHandler);
                resolve();
            };
            videoElement.addEventListener('seeked', seekedHandler);
        });
        await pose.send({ image: videoElement });
        setAnalysisProgress(((i + 1) / totalStepsToAnalyze) * 100);
    }
    
    // Remap keyframes to correct bar and beat after loop
    const mappedKeyframes = keyframes.map((frame, i) => {
        const absoluteStep = i * (stepsPerBar / captureResolution);
        const bar = Math.floor(absoluteStep / stepsPerBar);
        const beat = Math.floor(absoluteStep % stepsPerBar);
        return { ...frame, bar, beat };
    });

    videoElement.currentTime = originalVideoTime;
    setIsAnalyzing(false);
    if (!isCancelledRef.current) {
      onKeyframeData(mappedKeyframes);
    }
  }, [initializePoseEstimator, onKeyframeData, logDebug, captureThumbnail]);

  const cancelAnalysis = useCallback(() => {
    isCancelledRef.current = true;
    logDebug('warn', '[MotionAnalysis] Analysis cancellation requested.');
  }, [logDebug]);

  return { isAnalyzing, analysisProgress, startAnalysis, cancelAnalysis, startLiveTracking, stopLiveTracking };
};