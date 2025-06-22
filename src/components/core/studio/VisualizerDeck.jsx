import React from 'react';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';
import { useMotionAnalysisContext } from '../../../contexts/MotionAnalysisContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import LiveCameraFeed from '../../visualizers/LiveCameraFeed';

const DeckContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px; 
  aspect-ratio: 4 / 3;
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
`;

const VisualizerDeck = () => {
    const { 
        isLiveCamActive, 
        is2dOverlayEnabled, // Get the state for the 2D toggle
        isMirrored,
        selectedJoint 
    } = useUIState();
    
    const { livePose, isInitializing } = useMotionAnalysisContext();

    return (
        <DeckContainer>
            {/* 1. Render the raw camera feed if Live mode is active */}
            {isLiveCamActive && <LiveCameraFeed isMirrored={isMirrored} />}
            
            {/* --- FIX: This logic now correctly shows the overlay --- */}
            {/* It renders if the camera is live, the 2D toggle is on, AND there is a pose to draw */}
            {isLiveCamActive && is2dOverlayEnabled && livePose && (
                <P5SkeletalVisualizer
                    poseData={livePose}
                    analysisData={livePose.analysis}
                    isMirrored={isMirrored}
                    highlightJoint={selectedJoint}
                />
            )}

            {!isLiveCamActive && (
                 <span>Visualizer Deck</span>
            )}
            
            {isLiveCamActive && isInitializing && <span>Initializing AI Model...</span>}
        </DeckContainer>
    );
};

export default VisualizerDeck;