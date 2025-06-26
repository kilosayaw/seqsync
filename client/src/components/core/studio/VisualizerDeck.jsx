import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useUIState } from '../../../contexts/UIStateContext';
import { useMedia } from '../../../contexts/MediaContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import P5_2DSkeletalPreview from '../../visualizers/P5_2DSkeletalPreview';

const DeckContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: auto;
  aspect-ratio: 16 / 9;
  background-color: #111;
  border-radius: var(--border-radius-medium);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: ${({ $isMirrored }) => ($isMirrored ? 'scaleX(1)' : 'scaleX(-1)')};
`;

const VisualizerOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

const VisualizerDeck = () => { // Component no longer takes props
  const videoRef = useRef(null);
  const { updateLivePose } = usePlayback();
  
  // <<< FIX: Get all necessary state directly from the UI context >>>
  const { isLiveCamActive, isMirrored, visualizerMode } = useUIState(); 
  
  const { mediaUrl } = useMedia();

  const { livePoseData, startLiveTracking, stopLiveTracking } = useMotionAnalysis({
    onPoseUpdate: updateLivePose,
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isLiveCamActive) {
      let stream;
      const setupLiveCam = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            startLiveTracking(videoElement);
          };
        } catch (err) {
          console.error("Failed to initialize camera:", err);
        }
      };
      setupLiveCam();

      return () => {
        stopLiveTracking();
        if (stream) stream.getTracks().forEach(track => track.stop());
      };
    } else {
      stopLiveTracking();
      videoElement.srcObject = null;
      videoElement.src = mediaUrl;
    }
  }, [isLiveCamActive, mediaUrl, startLiveTracking, stopLiveTracking]);

  return (
    <DeckContainer>
      { (isLiveCamActive || mediaUrl) ? (
        <>
          <VideoElement 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted={isLiveCamActive} 
            // Use transient prop for styling
            $isMirrored={isLiveCamActive && isMirrored} 
          />
          <VisualizerOverlay>
            {isLiveCamActive && livePoseData && (
              visualizerMode === '2D' 
                ? <P5_2DSkeletalPreview poseData={livePoseData} isMirrored={isMirrored} />
                : <P5SkeletalVisualizer poseData={livePoseData} isMirrored={isMirrored} />
            )}
          </VisualizerOverlay>
        </>
      ) : (
        <span>Visualizer Deck</span>
      )}
    </DeckContainer>
  );
};

// Component no longer needs propTypes since it gets state from context.
export default VisualizerDeck;