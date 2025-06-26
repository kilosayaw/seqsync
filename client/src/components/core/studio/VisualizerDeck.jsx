import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { useMedia } from '../../../contexts/MediaContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import VideoMediaPlayer from '../media/VideoMediaPlayer.jsx';
import P5SkeletalVisualizer from '../../visualizers/P5SkeletalVisualizer.jsx';

const DeckContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: auto;
  aspect-ratio: 16 / 9;
  background-color: #1a293b;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VisualizerOverlay = styled.div`
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none;
`;

const PlaceholderText = styled.span`
    font-size: 1rem;
    color: #475569;
`;

const VisualizerDeck = ({ poseData }) => {
    const { videoRef, mediaStream } = useMedia();
    const { songData } = useSequence();
    const { isPlaying } = usePlayback();
    // --- We get isFeedMirrored here to mirror the video, but isOverlayMirrored will be handled by the data ---
    const { visualizerMode, selectedJoint, isFeedMirrored } = useUIState();

    const mediaUrl = songData.videoUrl;
    const hasMedia = mediaUrl || mediaStream;

    return (
        <DeckContainer>
            {hasMedia ? (
                <VideoMediaPlayer
                    ref={videoRef}
                    src={mediaUrl}
                    stream={mediaStream}
                    isPlaying={isPlaying}
                    // The video player itself should be mirrored based on the feed mirror toggle
                    isMirrored={isFeedMirrored} 
                />
            ) : (
                <PlaceholderText>No Video Loaded</PlaceholderText>
            )}
            {/* --- FIX 2: Remove the transform style to prevent double-mirroring the overlay --- */}
            <VisualizerOverlay>
                {poseData && (
                    // --- FIX 1 (cont.): Render the correct P5 component ---
                    <P5SkeletalVisualizer 
                        poseData={poseData} 
                        mode={visualizerMode} 
                        highlightJoint={selectedJoint} 
                    />
                )}
            </VisualizerOverlay>
        </DeckContainer>
    );
};

VisualizerDeck.propTypes = {
    poseData: PropTypes.object,
};

// Note: Removed onPlayerReady from prop-types as it's not used.
export default VisualizerDeck;