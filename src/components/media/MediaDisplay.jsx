import React, { useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import CameraFeed from '../ui/CameraFeed';
import PoseOverlay from '../ui/PoseOverlay';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import CameraQuickControls from '../ui/CameraQuickControls'; // Import the new controls
import PopOutVisualizer from '../ui/PopOutVisualizer'; // Import the portal component
import { useSequence } from '../../context/SequenceContext';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils';
import './MediaDisplay.css';

const MediaDisplay = () => {
    const { 
        isCameraActive, 
        activeVisualizer, 
        activePad, 
        selectedJoints, 
        animationState, 
        animationRange,
        isVisualizerPoppedOut,
        cameraCommand,
        setCameraCommand
    } = useUIState();
    
    const { songData } = useSequence();
    const containerRef = useRef(null);

    const activeSequencePose = songData[activePad] || null;
    const startSequencePose = songData[animationRange.start] || null;
    const endSequencePose = songData[animationRange.end] || null;

    const startPose = convertPoseToVisualizerFormat(startSequencePose);
    const endPose = convertPoseToVisualizerFormat(endSequencePose);
    const isFacingCamera = activeSequencePose?.meta?.isFacingCamera || false;

    const VisualizerAndControls = () => (
        <>
            <P5SkeletalVisualizer 
                startPose={startPose} 
                endPose={endPose} 
                animationState={animationState} 
                highlightJoints={selectedJoints} 
                isFacingCamera={isFacingCamera}
                cameraCommand={cameraCommand}
                onCommandComplete={() => setCameraCommand(null)}
                width={isVisualizerPoppedOut ? 600 : containerRef.current?.clientWidth || 300} 
                height={isVisualizerPoppedOut ? 600 : containerRef.current?.clientHeight || 300} 
            />
            <CameraQuickControls />
        </>
    );

    return (
        <>
            <div ref={containerRef} className="media-display-container">
                {isCameraActive ? (
                    <>
                        <CameraFeed />
                        <PoseOverlay />
                    </>
                ) : (
                    // When not popped out, render directly here.
                    !isVisualizerPoppedOut && activeVisualizer === 'full' && <VisualizerAndControls />
                )}
                 {activeVisualizer !== 'full' && activeVisualizer !== 'none' && !isCameraActive && (
                    <div className="placeholder-text">Visualizer Coming Soon</div>
                 )}
                 {activeVisualizer === 'none' && !isCameraActive && (
                    <div className="placeholder-text">Select a Visualizer</div>
                 )}
            </div>

            {/* If popped out, render inside the portal */}
            {isVisualizerPoppedOut && (
                <PopOutVisualizer>
                    <VisualizerAndControls />
                </PopOutVisualizer>
            )}
        </>
    );
};

export default MediaDisplay;