// src/components/media/MediaDisplay.jsx
import React, { useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import CameraFeed from '../ui/CameraFeed';
import PoseOverlay from '../ui/PoseOverlay';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import { useSequence } from '../../context/SequenceContext';
import { DEFAULT_POSE } from '../../utils/constants';
import './MediaDisplay.css';

const MediaDisplay = () => {
    const { 
        isCameraActive, 
        activeVisualizer, 
        activePad, 
        selectedJoints, 
        animationState, 
        animationRange 
    } = useUIState();
    
    const { songData } = useSequence();
    const containerRef = useRef(null);

    // DEFINITIVE FIX: Ensure a valid pose object with jointInfo is always created.
    const getPoseForPad = (padIndex) => {
        if (padIndex !== null && songData[padIndex]) {
            return { jointInfo: songData[padIndex].joints, grounding: { LF: songData[padIndex].joints.LF?.grounding, RF: songData[padIndex].joints.RF?.grounding } };
        }
        return DEFAULT_POSE;
    };

    const activePose = getPoseForPad(activePad);
    const startPose = getPoseForPad(animationRange.start);
    const endPose = getPoseForPad(animationRange.end);

    const VisualizerContent = () => {
        if (!containerRef.current) return null;
        const { width, height } = containerRef.current.getBoundingClientRect();

        switch (activeVisualizer) {
            case 'full':
                return <P5SkeletalVisualizer startPose={startPose} endPose={endPose} animationState={animationState} highlightJoints={selectedJoints} width={width} height={height} />;
            case 'core':
                return <CoreVisualizer pose={activePose} highlightedJoints={selectedJoints} viewMode={'3d'} width={width} height={height} />;
            default:
                return <div className="placeholder-text">Select a Visualizer</div>;
        }
    };

    return (
        <div ref={containerRef} className="media-display-container">
            {isCameraActive ? (
                <>
                    <CameraFeed />
                    <PoseOverlay />
                </>
            ) : (
                <VisualizerContent />
            )}
        </div>
    );
};

export default MediaDisplay;