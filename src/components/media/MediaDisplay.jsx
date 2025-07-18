import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useMedia } from '../../context/MediaContext.jsx';
import { useMotion } from '../../context/MotionContext.jsx';
import CameraFeed from '../ui/CameraFeed.jsx';
import PoseOverlay from '../ui/PoseOverlay.jsx';
import SkeletalVisualizer from './SkeletalVisualizer.jsx';
import CoreVisualizer from '../ui/CoreVisualizer.jsx';
import CameraQuickControls from '../ui/CameraQuickControls.jsx';
import PopOutVisualizer from '../ui/PopOutVisualizer.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils.js';
import GroundingDisplay from '../ui/GroundingDisplay.jsx';
import { useMotionAnalysis } from '../../hooks/useMotionAnalysis.js';
import './MediaDisplay.css';

const MediaDisplay = ({ selectedJoints }) => {
    const { mediaType, mediaSource, videoRef } = useMedia();
    const { 
        isCameraActive, 
        activeVisualizer, 
        activePad,
        isVisualizerPoppedOut,
        weightDistribution 
    } = useUIState();
    const { setLivePoseData } = useMotion();
    
    // Wire up motion analysis to the main video ref
    useMotionAnalysis(videoRef, setLivePoseData);
    
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
                return <CoreVisualizer poseData={endPose} highlightJoints={selectedJoints} width={width} height={height} weightDistribution={weightDistribution} />;
            default:
                return <div className="placeholder-text">Select a Visualizer</div>;
        }
    };

    return (
        <>
            <div ref={containerRef} className="media-display-container">
                {isCameraActive ? (
                    <><CameraFeed /><PoseOverlay /></>
                ) : mediaType === 'video' && mediaSource ? (
                    <>
                        <video ref={videoRef} src={mediaSource} className="video-player-element" playsInline muted />
                        <PoseOverlay />
                    </>
                ) : (
                    <VisualizerComponent />
                )}
                
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

MediaDisplay.propTypes = {
    selectedJoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MediaDisplay;