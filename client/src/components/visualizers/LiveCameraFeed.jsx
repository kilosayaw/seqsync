import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useMedia } from '../../contexts/MediaContext'; // This component gets its data from the MediaContext

const VideoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the video fills the container without distortion */
  transform: ${({ $isMirrored }) => ($isMirrored ? 'scaleX(-1)' : 'scaleX(1)')};
`;

const LiveCameraFeed = ({ isMirrored }) => {
    // Get the shared videoRef from the MediaContext. This is where the camera stream is attached.
    const { videoRef } = useMedia();

    return (
        <VideoContainer>
            {/* The video element is controlled by the MediaContext, 
                but we pass the isMirrored prop to control its visual appearance here. */}
            <VideoElement ref={videoRef} $isMirrored={isMirrored} autoPlay playsInline muted />
        </VideoContainer>
    );
};

LiveCameraFeed.propTypes = {
    isMirrored: PropTypes.bool.isRequired,
};

export default LiveCameraFeed;