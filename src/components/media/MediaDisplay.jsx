import React, { useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import CameraFeed from '../ui/CameraFeed';
import PoseOverlay from '../ui/PoseOverlay';
import SkeletalVisualizer from './SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import CameraQuickControls from '../ui/CameraQuickControls';
import PopOutVisualizer from '../ui/PopOutVisualizer';
import { useSequence } from '../../context/SequenceContext';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils';
import GroundingDisplay from '../ui/GroundingDisplay';
import './MediaDisplay.css';

const MediaDisplay = ({ selectedJoints }) => {
    const { 
        isCameraActive, 
        activeVisualizer, 
        activePad, 
        isVisualizerPoppedOut,
        weightDistribution 
    } = useUIState();
    
    const { songData } = useSequence();
    const containerRef = useRef(null);

    const endSequencePose = songData[activePad] || null;
    const endPose = convertPoseToVisualizerFormat(endSequencePose);

    const VisualizerComponent = ({ isPoppedOut = false }) => {
        const container = isPoppedOut ? { clientWidth: 600, clientHeight: 600 } : containerRef.current;
        const width = container?.clientWidth || 300;
        const height = container?.clientHeight || 300;

        switch(activeVisualizer) {
            case 'full':
                return <SkeletalVisualizer poseData={endPose} highlightJoints={selectedJoints} width={width} height={height} />;
            case 'core':
                return <CoreVisualizer poseData={endPose} width={width} height={height} weightDistribution={weightDistribution} />;
            case 'none':
                return <div className="placeholder-text">Select a Visualizer</div>;
            default:
                return <div className="placeholder-text">Visualizer Coming Soon</div>;
        }
    };

    return (
        <>
            <div ref={containerRef} className="media-display-container">
                {isCameraActive ? <><CameraFeed /><PoseOverlay /></> : <VisualizerComponent />}
                {!isCameraActive && activeVisualizer !== 'none' && <CameraQuickControls />}
                {!isCameraActive && activeVisualizer !== 'none' && <GroundingDisplay />}
            </div>

            {isVisualizerPoppedOut && (
                <PopOutVisualizer>
                    <VisualizerComponent isPoppedOut={true} />
                </PopOutVisualizer>
            )}
        </>
    );
};
export default MediaDisplay;