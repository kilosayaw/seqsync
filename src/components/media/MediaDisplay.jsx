import React, { useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import CameraFeed from '../ui/CameraFeed';
import PoseOverlay from '../ui/PoseOverlay';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import { useSequence } from '../../context/SequenceContext';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils'; // DEFINITIVE: Import the new utility
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

    // Get the raw pose data from the sequence
    const activeSequencePose = activePad !== null ? songData[activePad] : null;
    const startSequencePose = animationRange.start !== null ? songData[animationRange.start] : null;
    const endSequencePose = animationRange.end !== null ? songData[animationRange.end] : null;

    // DEFINITIVE FIX: Convert all poses into the visualizer-safe format before using them.
    const activePose = convertPoseToVisualizerFormat(activeSequencePose);
    const startPose = convertPoseToVisualizerFormat(startSequencePose);
    const endPose = convertPoseToVisualizerFormat(endSequencePose);

    const VisualizerContent = () => {
        if (!containerRef.current) return null;
        const { width, height } = containerRef.current.getBoundingClientRect();

        switch (activeVisualizer) {
            case 'full':
                return <P5SkeletalVisualizer startPose={startPose} endPose={endPose} animationState={animationState} highlightJoints={selectedJoints} width={width} height={height} />;
            case 'core':
                // Now passing the safely converted 'activePose' object
                return <CoreVisualizer poseData={activePose} highlightedJoints={selectedJoints} viewMode={'3d'} width={width} height={height} />;
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