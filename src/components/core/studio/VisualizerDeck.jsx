// /client/src/components/core/studio/VisualizerDeck.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { useMedia } from '../../../contexts/MediaContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import { useSequence } from '../../../contexts/SequenceContext.jsx';

import VideoMediaPlayer from '../media/VideoMediaPlayer.jsx';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer.jsx';

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

// This component is now "dumb". It just receives data and displays it.
const VisualizerDeck = ({ poseData }) => {
    const { videoRef, mediaStream } = useMedia();
    const { songData } = useSequence();
    const { isPlaying } = usePlayback();
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
                    // onReady is handled by the parent Sequencer component now
                />
            ) : (
                <PlaceholderText>No Video Loaded</PlaceholderText>
            )}

            {/* The overlay is flipped visually with CSS */}
            <VisualizerOverlay style={{ transform: isFeedMirrored ? 'scaleX(-1)' : 'scaleX(1)' }}>
                {poseData && (
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

export default VisualizerDeck;