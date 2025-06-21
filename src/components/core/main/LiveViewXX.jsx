import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useUIState } from '../../../contexts/UIStateContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import P5_2DSkeletalPreview from '../../visualizers/P5_2DSkeletalPreviewX';

const LiveViewContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: auto;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: var(--border-radius-medium);
  overflow: hidden;
`;

// <<< FIX: The video now flips based on the isMirrored prop >>>
const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* When not mirrored, we flip it to act like a real mirror. When mirrored, we un-flip it. */
  transform: ${({ isMirrored }) => (isMirrored ? 'scaleX(1)' : 'scaleX(-1)')};
`;

const VisualizerOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

const LiveView = ({ isMirrored }) => { 
  const videoRef = useRef(null);
  const { updateLivePose } = usePlayback();
  const { visualizerMode } = useUIState();

  const { livePoseData, startLiveTracking, stopLiveTracking } = useMotionAnalysis({
    onPoseUpdate: updateLivePose,
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    let stream;
    const setupAndStart = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported by this browser.");
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            startLiveTracking(videoElement);
          };
        }
      } catch (err) {
        console.error("Failed to initialize camera or start tracking:", err);
      }
    };
    setupAndStart();
    return () => {
      stopLiveTracking();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startLiveTracking, stopLiveTracking]);

  return (
    <LiveViewContainer>
      <VideoElement ref={videoRef} autoPlay playsInline muted isMirrored={isMirrored} />
      <VisualizerOverlay>
        {livePoseData && (
          visualizerMode === '2D' 
            ? <P5_2DSkeletalPreview poseData={livePoseData} isMirrored={isMirrored} />
            // <<< FIX: Pass isMirrored to the 3D visualizer as well >>>
            : <P5SkeletalVisualizer poseData={livePoseData} isMirrored={isMirrored} />
        )}
      </VisualizerOverlay>
    </LiveViewContainer>
  );
};

LiveView.propTypes = {
    isMirrored: PropTypes.bool.isRequired,
};

export default LiveView;