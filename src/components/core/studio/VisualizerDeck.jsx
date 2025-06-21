import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useUIState } from '../../../contexts/UIStateContext';
import { useMedia } from '../../../contexts/MediaContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';

const DeckContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px; /* Enforce a max width for consistency */
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

const DisplayContainer = styled.div`
  /* ... */
  width: 100%; /* It will now fill the ContentStack container */
  /* ... */
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

const VisualizerDeck = () => {
  const videoRef = useRef(null);
  const { updateLivePose, setVideoElementForCapture } = usePlayback(); // <<< FIX: Get the function from the hook
  const { isLiveCamActive, isMirrored, visualizerMode, selectedJoint } = useUIState(); 
  const { mediaUrl } = useMedia();
  const { livePoseData, startLiveTracking, stopLiveTracking } = useMotionAnalysis({
    onPoseUpdate: updateLivePose,
  });

  // This effect now correctly passes the video element to the context
  useEffect(() => {
    if (setVideoElementForCapture) {
        setVideoElementForCapture(videoRef.current);
    }
  }, [setVideoElementForCapture]);

  // Effect to handle switching between live cam and uploaded video
    // This effect handles switching the video source between live cam and uploaded media
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // --- Live Camera Logic ---
    if (isLiveCamActive) {
      let stream;
      const setupLiveCam = async () => {
        try {
          // Request access to the user's camera
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoElement.srcObject = stream;
          // Wait for the video metadata to load before playing
          videoElement.onloadeddata = () => {
            videoElement.play();
            // Start the motion analysis loop
            startLiveTracking(videoElement);
          };
        } catch (err) {
          console.error("Failed to initialize camera:", err);
        }
      };
      setupLiveCam();

      // This is the cleanup function that runs when the effect ends
      // (e.g., when the user toggles the live cam off)
      return () => {
        stopLiveTracking();
        if (stream) {
          // Stop all camera tracks to turn off the camera light
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      // --- Uploaded Media Logic ---
      // If live cam is not active, stop tracking and set the video source to the uploaded media URL.
      stopLiveTracking();
      videoElement.srcObject = null; // Clear the camera stream
      videoElement.src = mediaUrl;
    }
  }, [isLiveCamActive, mediaUrl, startLiveTracking, stopLiveTracking]); // Dependencies for this effect

  return (
    <DeckContainer>
      { (isLiveCamActive || mediaUrl) ? (
        <>
          <VideoElement 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted={isLiveCamActive} 
            $isMirrored={isLiveCamActive && isMirrored} 
          />
          <VisualizerOverlay>
                {isLiveCamActive && livePoseData && (
                    <P5SkeletalVisualizer 
                        poseData={livePoseData} 
                        mode={visualizerMode}
                        highlightJoint={selectedJoint}
                    />
                )}
            </VisualizerOverlay>
        </>
      ) : ( <span>Visualizer Deck</span> )}
    </DeckContainer>
  );
};

export default VisualizerDeck;