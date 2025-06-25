// /client/src/hooks/useMotionAnalysis.js
import { useState, useRef, useCallback, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import { transformTfPoseToSeqPose, generatePoseThumbnail } from '../utils/thumbnailUtils.js';

const captureVideoFrame = (videoElement) => {
    if (!videoElement || videoElement.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Small thumbnail size
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8); // Return a compressed JPEG
};

export const useMotionAnalysis = ({ onPoseUpdate, onAnalysisComplete, isOverlayMirrored }) => {
    const [detector, setDetector] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [livePoseData, setLivePoseData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    const videoRef = useRef(null);
    const rafIdRef = useRef(null);
    const analysisControllerRef = useRef(null);
    
    useEffect(() => {
        const init = async () => {
            if (detector) {
                setIsInitializing(false);
                return;
            }
            console.log('[MotionAnalysis] Initializing detector from local path...');
            try {
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;

                // --- THIS IS THE FIX ---
                // The path must be an absolute path from the root of the server.
                // The 'public' directory is served at the root '/'.
                const modelUrl = '/models/movenet/model.json';
                
                const detectorConfig = {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                    modelUrl: modelUrl
                };
                
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                console.log('[MotionAnalysis] Local detector initialized successfully.');
                toast.success('Analysis engine loaded.');

            } catch (err) {
                console.error("Fatal: Failed to initialize pose detector:", err);
                toast.error(`Failed to load analysis engine: ${err.message}`);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [detector]);

    const estimationLoop = useCallback(async () => {
        if (!detector || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            if(isTracking) setIsTracking(false);
            return;
        }
        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: false });
        if (poses && poses.length > 0) {
            const seqPose = transformTfPoseToSeqPose(poses[0], videoRef.current, isOverlayMirrored);
            if (seqPose) {
                setLivePoseData(seqPose);
                if (onPoseUpdate) onPoseUpdate(seqPose);
            }
        }
        rafIdRef.current = requestAnimationFrame(estimationLoop);
    }, [detector, isTracking, isOverlayMirrored, onPoseUpdate]);

    useEffect(() => {
        if (isTracking) {
            rafIdRef.current = requestAnimationFrame(estimationLoop);
        } else {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        }
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isTracking, estimationLoop]);
    
    const startLiveTracking = useCallback((videoElement) => {
        if (!detector || isInitializing) return;
        if (videoElement && (videoElement.srcObject || videoElement.src)) {
            videoRef.current = videoElement;
            setIsTracking(true);
        }
    }, [detector, isInitializing]);

    useEffect(() => {
        const init = async () => {
            if (detector) {
                setIsInitializing(false);
                return;
            }
            console.log('[MotionAnalysis] Initializing detector from local path...');
            try {
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;

                // --- THIS IS THE FIX ---
                // The URL must be an absolute path from the server root.
                const modelUrl = '/models/movenet/model.json';
                
                const detectorConfig = {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                    modelUrl: modelUrl 
                };
                
                const createdDetector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(createdDetector);
                console.log('[MotionAnalysis] Local detector initialized successfully.');
                toast.success('Analysis engine loaded.');

            } catch (err) {
                console.error("Fatal: Failed to initialize pose detector:", err);
                toast.error(`Failed to load analysis engine.`);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [detector]); 
    
    const stopLiveTracking = useCallback(() => {
        setIsTracking(false);
    }, []);

    const startFullAnalysis = useCallback(async (videoElement, bpm, totalBars) => {
        if (isAnalyzing || !detector) { /* ... */ return; }
        
        // ... (setup logic is correct)

        try {
            for (let i = 0; i < totalSteps; i++) {
                // ... (time seeking logic is correct)
                
                await new Promise(resolve => { videoElement.onseeked = resolve; });

                const poses = await detector.estimatePoses(videoElement, { flipHorizontal: false });
                
                // --- THIS IS THE NEW LOGIC ---
                const snapshot = captureVideoFrame(videoElement);
                
                let result = {
                    bar: Math.floor(i / 16),
                    beat: i % 16,
                    poseData: null,
                    thumbnail: snapshot, // Use the video snapshot as the thumbnail
                };

                if (poses && poses.length > 0) {
                    const poseData = transformTfPoseToSeqPose(poses[0], videoElement, isOverlayMirrored);
                    if (poseData) {
                        result.poseData = poseData;
                    }
                }
                results.push(result);
                // --- END OF NEW LOGIC ---

                setAnalysisProgress(((i + 1) / totalSteps) * 100);
            }
            if (!signal.aborted && onAnalysisComplete) {
                onAnalysisComplete(results);
            }
        } catch (err) { /* ... */ }
        finally { /* ... */ }
    }, [detector, isAnalyzing, isOverlayMirrored, onAnalysisComplete]);

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