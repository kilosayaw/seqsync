// src/components/layout/CenterConsole.jsx
import React, { useRef, useState, useEffect } from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import P5SkeletalVisualizer from '../media/P5SkeletalVisualizer';
import CoreVisualizer from '../ui/CoreVisualizer';
import JointRoleSelector from '../ui/JointRoleSelector';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { DEFAULT_POSE } from '../../utils/constants';

import './CenterConsole.css';

const CenterConsole = () => {
    const { preRollCount } = usePlayback();
    const { notification, activePad, selectedJoints, animationState, animationRange, isPreviewMode, coreViewMode } = useUIState();
    const { songData } = useSequence();
    
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const highlightJoint = selectedJoints.length > 0 ? selectedJoints[0] : null;
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
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => { 
            if (containerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    // DEFINITIVE FIX: Restored the logic that defines the overlayContent variable.
    let overlayContent = null;
    if (preRollCount > 0) {
        overlayContent = <span className="preroll-countdown">{preRollCount}</span>;
    } else if (notification) {
        overlayContent = <span className="feed-notification">{notification}</span>;
    }

    const VisualizerContent = () => {
        if (dimensions.width === 0) return null;

        if (isPreviewMode) {
            return (
                <P5SkeletalVisualizer
                    startPose={startPose}
                    endPose={endPose}
                    animationState={animationState}
                    highlightJoint={highlightJoint}
                    width={dimensions.width}
                    height={dimensions.height}
                />
            );
        }
        
        return (
            <CoreVisualizer 
                pose={activePose}
                highlightedJoint={highlightJoint}
                viewMode={coreViewMode}
                width={dimensions.width}
                height={dimensions.height}
            />
        );
    };

    return (
        <div className="center-console-container">
            <div ref={containerRef} className="video-feed-placeholder">
                <VisualizerContent />
                {overlayContent}
            </div>
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
                <JointRoleSelector /> 
            </div>
            <Crossfader />
        </div>
    );
};
export default CenterConsole;