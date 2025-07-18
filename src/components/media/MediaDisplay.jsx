import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useMedia } from '../../context/MediaContext.jsx';
import { useMotion } from '../../context/MotionContext.jsx';
import CameraFeed from '../ui/CameraFeed.jsx';
import PoseOverlay from '../ui/PoseOverlay.jsx';
import SkeletalVisualizer from './SkeletalVisualizer.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils.js';
import { useMotionAnalysis } from '../../hooks/useMotionAnalysis.js';
import './MediaDisplay.css';

const MediaDisplay = ({ selectedJoints }) => {
    const { mediaType, mediaSource, videoRef: fileVideoRef } = useMedia(); // This is the ref for the loaded file
    const { isCameraActive, activeVisualizer, activePad } = useUIState();
    const { setLivePoseData } = useMotion();
    const { songData } = useSequence();
    
    const containerRef = useRef(null);
    const cameraVideoRef = useRef(null); // Create a separate ref for the CameraFeed's video element

    // DEFINITIVE FIX: Conditionally select which video ref to send for analysis
    const analysisTargetRef = isCameraActive ? cameraVideoRef : fileVideoRef;
    useMotionAnalysis(analysisTargetRef, setLivePoseData);
    
    const endSequencePose = songData[activePad] || null;
    const endPose = convertPoseToVisualizerFormat(endSequencePose);

    const VisualizerComponent = () => {
        const width = containerRef.current?.clientWidth || 300;
        const height = containerRef.current?.clientHeight || 300;
        if (activeVisualizer === 'full') {
            return <SkeletalVisualizer poseData={endPose} highlightJoints={selectedJoints} width={width} height={height} />;
        }
        // Add other visualizers like CoreVisualizer here if needed
        return <div className="placeholder-text">Select a Visualizer</div>;
    };

    return (
        <div ref={containerRef} className="media-display-container">
            {isCameraActive ? (
                // Pass the dedicated ref to the CameraFeed component
                <><CameraFeed ref={cameraVideoRef} /><PoseOverlay /></>
            ) : mediaType === 'video' && mediaSource ? (
                // The loaded video uses the fileVideoRef from MediaContext
                <><video ref={fileVideoRef} src={mediaSource} className="video-player-element" playsInline muted /><PoseOverlay /></>
            ) : (
                <VisualizerComponent />
            )}
            {/* Other controls like CameraQuickControls can remain here */}
        </div>
    );
};

MediaDisplay.propTypes = {
    selectedJoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MediaDisplay;