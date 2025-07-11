import React, { useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import CameraFeed from '../ui/CameraFeed';
import PoseOverlay from '../ui/PoseOverlay';
import P5SkeletalVisualizer from './P5SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import CameraQuickControls from '../ui/CameraQuickControls';
import PopOutVisualizer from '../ui/PopOutVisualizer';
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
        setCameraCommand,
        // PHOENIX PROTOCOL: Get weightDistribution from state.
        weightDistribution, 
    } = useUIState();
    
    const { songData } = useSequence();
    const containerRef = useRef(null);

    const activeSequencePose = songData[activePad] || null;
    const startSequencePose = songData[animationRange.start] || null;
    const endSequencePose = songData[animationRange.end] || null;

    const startPose = convertPoseToVisualizerFormat(startSequencePose);
    const endPose = convertPoseToVisualizerFormat(endSequencePose);
    const isFacingCamera = activeSequencePose?.meta?.isFacingCamera || false;

    // PHOENIX PROTOCOL: Created a separate component for the core vis to pass props.
    const CoreVisualizerComponent = () => (
        <CoreVisualizer
            poseData={endPose} // Core viz doesn't animate, shows current pad's pose
            weightDistribution={weightDistribution}
            width={isVisualizerPoppedOut ? 600 : containerRef.current?.clientWidth || 300} 
            height={isVisualizerPoppedOut ? 600 : containerRef.current?.clientHeight || 300} 
        />
    );

    const SkeletalVisualizerComponent = () => (
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

    const renderVisualizer = () => {
        if (isVisualizerPoppedOut) return null; // Rendered in portal if popped out

        switch(activeVisualizer) {
            case 'full':
                return <SkeletalVisualizerComponent />;
            case 'core':
                return <CoreVisualizerComponent />;
            case 'none':
                return <div className="placeholder-text">Select a Visualizer</div>;
            default:
                return <div className="placeholder-text">Visualizer Coming Soon</div>;
        }
    };

    const renderVisualizerForPopOut = () => {
        switch(activeVisualizer) {
            case 'full':
                return <SkeletalVisualizerComponent />;
            case 'core':
                return <CoreVisualizerComponent />;
            default:
                return null;
        }
    };

    return (
        <>
            <div ref={containerRef} className="media-display-container">
                {isCameraActive ? <><CameraFeed /><PoseOverlay /></> : renderVisualizer()}
            </div>

            {isVisualizerPoppedOut && (
                <PopOutVisualizer>
                    {renderVisualizerForPopOut()}
                </PopOutVisualizer>
            )}
        </>
    );
};

export default MediaDisplay;