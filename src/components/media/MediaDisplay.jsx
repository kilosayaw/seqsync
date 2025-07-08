// src/components/media/MediaDisplay.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { useSequence } from '../../context/SequenceContext';
import { useMotionAnalysis } from '../../hooks/useMotionAnalysis';
import { transformBlazePoseToSEQSour } from '../../utils/poseUtils.js'; 
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import styles from './MediaDisplay.module.css';

const MediaDisplay = () => {
    const { 
        videoRef, waveformContainerRef, isCameraActive, isMotionTrackingEnabled, mediaFile,
        isRecording, currentBar, currentBeat
    } = useMedia();
    
    const { updateBeatWithPose } = useSequence();

    const [livePoseData, setLivePoseData] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const lastRecordedBeatRef = useRef(null); 

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => { if (containerRef.current) resizeObserver.unobserve(containerRef.current); };
    }, []);

    const handlePoseDetected = useCallback((pose) => {
        if (pose && videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            const transformedPose = transformBlazePoseToSEQSour(pose, videoWidth, videoHeight);
            setLivePoseData(transformedPose);
        } else {
            setLivePoseData(null);
        }
    }, [videoRef]);

    useMotionAnalysis(videoRef, isMotionTrackingEnabled ? handlePoseDetected : null);

    useEffect(() => {
        const beatId = `${currentBar}:${currentBeat}`;
        if (isRecording && livePoseData && lastRecordedBeatRef.current !== beatId) {
            console.log(`RECORDING POSE to Bar ${currentBar}, Beat ${currentBeat}`);
            updateBeatWithPose(currentBar, currentBeat, livePoseData);
            lastRecordedBeatRef.current = beatId;
        }
    }, [currentBeat, currentBar, isRecording, livePoseData, updateBeatWithPose]);

    return (
        <div ref={containerRef} className={styles.mediaContainer}>
            <video ref={videoRef} className={`${styles.videoElement} ${isCameraActive ? styles.visible : ''}`} autoPlay playsInline muted />
            {isCameraActive && isMotionTrackingEnabled && dimensions.width > 0 && (
                <P5SkeletalVisualizer 
                    poseData={livePoseData} 
                    width={dimensions.width}
                    height={dimensions.height}
                />
            )}
            <div ref={waveformContainerRef} className={`${styles.waveform} ${mediaFile && !isCameraActive ? styles.visible : ''}`} />
        </div>
    );
};
export default MediaDisplay;