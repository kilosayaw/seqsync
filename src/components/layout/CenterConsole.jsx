// src/components/layout/CenterConsole.jsx
import React, { useRef, useState, useEffect } from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import P5SkeletalVisualizer from '../media/P5SkeletalVisualizer';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { DEFAULT_POSE } from '../../utils/constants';
import './CenterConsole.css';

const CenterConsole = () => {
    const { preRollCount } = usePlayback();
    // DEFINITIVE: Get the new isPreviewMode state
    const { notification, activePad, selectedJoints, animationState, animationRange, isPreviewMode } = useUIState();
    const { songData } = useSequence();
    
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const highlightJoint = selectedJoints.length > 0 ? selectedJoints[0] : null;

    // Use the pose from the active pad if available, otherwise the default pose.
    const activePose = activePad !== null ? { jointInfo: songData[activePad]?.joints } : DEFAULT_POSE;
    const startPose = animationRange.start !== null ? { jointInfo: songData[animationRange.start]?.joints } : activePose;
    const endPose = animationRange.end !== null ? { jointInfo: songData[animationRange.end]?.joints } : activePose;
    
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

    let overlayContent = null;
    if (preRollCount > 0) {
        overlayContent = <span className="preroll-countdown">{preRollCount}</span>;
    } else if (notification) {
        overlayContent = <span className="feed-notification">{notification}</span>;
    }

    return (
        <div className="center-console-container">
            <div ref={containerRef} className="video-feed-placeholder">
                {/* DEFINITIVE: Render the visualizer if dimensions are calculated AND preview mode is on */}
                {dimensions.width > 0 && isPreviewMode && (
                    <P5SkeletalVisualizer
                        startPose={startPose}
                        endPose={endPose}
                        animationState={animationState}
                        highlightJoint={highlightJoint}
                        width={dimensions.width}
                        height={dimensions.height}
                    />
                )}
                {overlayContent}
            </div>
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
            </div>
            <Crossfader />
        </div>
    );
};
export default CenterConsole;