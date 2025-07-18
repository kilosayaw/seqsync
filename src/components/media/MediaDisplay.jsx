import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useMedia } from '../../context/MediaContext.jsx';
import { useMotion } from '../../context/MotionContext.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import CameraFeed from '../ui/CameraFeed.jsx';
import PoseOverlay from '../ui/PoseOverlay.jsx';
import SkeletalVisualizer from './SkeletalVisualizer.jsx';
import { useMotionAnalysis } from '../../hooks/useMotionAnalysis.js';
import { TENSORFLOW_TO_SEQ_MAP, DEFAULT_POSE } from '../../utils/constants'; // Import constants
import './MediaDisplay.css';

const MediaDisplay = ({ selectedJoints }) => {
    const { mediaType, mediaSource, videoRef: fileVideoRef } = useMedia();
    const { isCameraActive, activeVisualizer, activePad } = useUIState();
    const { livePoseData, setLivePoseData } = useMotion();
    const { songData } = useSequence();
    
    const containerRef = useRef(null);
    const cameraVideoRef = useRef(null);

    const analysisTargetRef = isCameraActive ? cameraVideoRef : fileVideoRef;
    useMotionAnalysis(analysisTargetRef, setLivePoseData);
    
    // --- DEFINITIVE FIX & UPGRADE for Phase 1 ---
    // This replaces the old `convertPoseToVisualizerFormat` logic.
    // It creates the rich pose object required by the new ribbon renderer.
    const transformedPoseData = useMemo(() => {
        let sourceJoints;

        if (livePoseData?.keypoints) {
            // If live camera data exists, use it as the primary source for vectors.
            sourceJoints = {};
            livePoseData.keypoints.forEach(kp => {
                const jointId = TENSORFLOW_TO_SEQ_MAP[kp.name];
                if (jointId) {
                    // CRITICAL: Get rotation data from the *current pad's* sequence data.
                    // This allows you to "steer" the live model with your saved notations.
                    const sequenceJoint = songData[activePad]?.joints?.[jointId] || {};
                    sourceJoints[jointId] = {
                        vector: { x: kp.x, y: kp.y, z: kp.z || 0 },
                        score: kp.score,
                        rotationType: sequenceJoint.rotationType || 'NEU',
                        rotationIntensity: sequenceJoint.rotationIntensity || 0,
                    };
                }
            });
        } else if (songData[activePad]?.joints) {
            // If no live data, use the complete saved pose from the active pad.
            sourceJoints = songData[activePad].joints;
        } else {
            // Fallback to a default pose if nothing else is available.
            sourceJoints = DEFAULT_POSE.jointInfo;
        }

        return { jointInfo: sourceJoints };

    }, [livePoseData, songData, activePad]);

    // This component renders the correct visualizer based on the current state.
    const VisualizerComponent = () => {
        const width = containerRef.current?.clientWidth || 300;
        const height = containerRef.current?.clientHeight || 300;

        switch(activeVisualizer) {
            case 'full':
                // It now passes the new, rich data structure to the renderer.
                return <SkeletalVisualizer poseData={transformedPoseData} highlightJoints={selectedJoints} width={width} height={height} />;
            // Your 'core' visualizer case would go here.
            // case 'core':
            //     return <CoreVisualizer ... />;
            default:
                return <div className="placeholder-text">Select a Visualizer</div>;
        }
    };

    return (
        <div ref={containerRef} className="media-display-container">
            {isCameraActive ? (
                <>
                    <CameraFeed ref={cameraVideoRef} />
                    <PoseOverlay />
                </>
            ) : mediaType === 'video' && mediaSource ? (
                <>
                    <video ref={fileVideoRef} src={mediaSource} className="video-player-element" playsInline muted />
                    <PoseOverlay />
                </>
            ) : (
                <VisualizerComponent />
            )}
            {/* Your other controls (CameraQuickControls, etc.) remain untouched. */}
        </div>
    );
};

MediaDisplay.propTypes = {
    selectedJoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MediaDisplay;