import React from 'react';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useMotionAnalysisContext } from '../../../contexts/MotionAnalysisContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import LiveCameraFeed from '../../visualizers/LiveCameraFeed';

const DeckContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px; 
  aspect-ratio: 4 / 3;
  background-color: #020617;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
`;

const VisualizerDeck = () => {
    // --- FIX: Add selectedBar and selectedBeat back to the destructuring ---
    const { 
        isLiveCamActive, 
        is2dOverlayEnabled, 
        isMirrored,
        selectedBar, 
        selectedBeat,
        selectedJoint 
    } = useUIState();
    const { getBeatData } = useSequence();
    const { livePose, isAnalyzing } = useMotionAnalysisContext();

    let poseToDisplay = null;
    let analysisToDisplay = null;

    if (isLiveCamActive) {
        poseToDisplay = livePose;
        // The analysis data is now nested inside the livePose object
        analysisToDisplay = livePose?.analysis;
    } else {
        const beatData = getBeatData(selectedBar, selectedBeat);
        poseToDisplay = beatData?.pose;
        analysisToDisplay = beatData?.pose?.analysis;
    }

    return (
        <DeckContainer>
            {isLiveCamActive && <LiveCameraFeed isMirrored={isMirrored} />}
            
            {isLiveCamActive && is2dOverlayEnabled && livePose && (
                <P5SkeletalVisualizer
                    poseData={poseToDisplay}
                    analysisData={analysisToDisplay}
                    isMirrored={isMirrored}
                    highlightJoint={selectedJoint}
                />
            )}

            {!isLiveCamActive && (
                 <span>Visualizer Deck</span>
            )}
        </DeckContainer>
    );
};

export default VisualizerDeck;