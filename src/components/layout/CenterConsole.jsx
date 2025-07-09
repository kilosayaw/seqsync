// src/components/layout/CenterConsole.jsx
import React, { useRef, useState, useEffect } from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import P5SkeletalVisualizer from '../media/P5SkeletalVisualizer'; // DEFINITIVE: Import the visualizer
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { DEFAULT_POSE } from '../../utils/constants'; // DEFINITIVE: Import default pose
import classNames from 'classnames';
import './CenterConsole.css';

const CenterConsole = () => {
    const { preRollCount } = usePlayback();
    const { notification, activePad, selectedJoints } = useUIState();
    const { songData } = useSequence();
    
    // DEFINITIVE: Refs and state for getting the container size for the p5 canvas
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // DEFINITIVE: Logic to get the data for the visualizer
    const highlightJoint = selectedJoints.length > 0 ? selectedJoints[0] : null;
    // If a pad is active, get its pose data. Otherwise, use the default T-pose.
    const poseDataForVisualizer = activePad !== null && songData[activePad]
        ? { jointInfo: songData[activePad]?.joints } 
        : DEFAULT_POSE;

    // DEFINITIVE: Effect to measure the container and update dimensions
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

    // Determine what to display as an overlay: pre-roll > notification
    let overlayContent = null;
    if (preRollCount > 0) {
        overlayContent = <span className="preroll-countdown">{preRollCount}</span>;
    } else if (notification) {
        overlayContent = <span className="feed-notification">{notification}</span>;
    }

    return (
        <div className="center-console-container">
            {/* The ref is attached here to measure its size */}
            <div ref={containerRef} className="video-feed-placeholder">
                {/* 
                  DEFINITIVE: Render the visualizer if dimensions are calculated.
                  It will draw the stick figure. The overlayContent (countdown, etc.)
                  will appear on top of it.
                */}
                {dimensions.width > 0 && (
                    <P5SkeletalVisualizer
                        poseData={poseDataForVisualizer}
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