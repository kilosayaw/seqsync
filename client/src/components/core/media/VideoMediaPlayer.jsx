import React, { useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Media Player with forwarded ref so that StepSequencerControls or SyncHandler can control it.
 */
const VideoMediaPlayer = forwardRef(({ mediaSrc, mediaType, className = "" }, ref) => {
  useEffect(() => {
    if (!mediaSrc) {
      // Reset the ref if no media is loaded
      if (ref?.current) ref.current = null;
    }
  }, [mediaSrc, ref]);

  if (!mediaSrc) {
    return (
      <div
        className={`flex items-center justify-center text-center text-xs text-gray-500 bg-gray-800/30 rounded-md ${className || 'w-full aspect-[9/16]'}`}
        style={{ minHeight: '150px' }}
      >
        Upload Media to View
      </div>
    );
  }

  const commonProps = {
    ref: ref,
    controls: true,
    className: `w-full h-full object-contain ${className}`,
  };

  if (mediaType === 'video') {
    return (
      <video {...commonProps} src={mediaSrc} onError={e => console.error("Video Error:", e)}>
        Your browser does not support the video tag.
      </video>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-700/50 rounded ${className}`}>
        <p className="text-gray-300 text-sm p-2 truncate w-full text-center">
          Audio: {mediaSrc.split('/').pop().split('#')[0].split('?')[0]}
        </p>
        <audio {...commonProps} src={mediaSrc} onError={e => console.error("Audio Error:", e)}>
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center text-xs text-gray-400 ${className}`}>
      Unsupported media type or loading...
    </div>
  );
});

VideoMediaPlayer.displayName = 'VideoMediaPlayer';

VideoMediaPlayer.propTypes = {
  mediaSrc: PropTypes.string,
  mediaType: PropTypes.oneOf(['video', 'audio']),
  className: PropTypes.string,
};

export default VideoMediaPlayer;
