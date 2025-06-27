import React from 'react';
import PropTypes from 'prop-types';

const VideoMediaPlayer = React.forwardRef(({ mediaSrc }, ref) => {
  if (!mediaSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-gray-500">
        <p>No media loaded.</p>
      </div>
    );
  }

  return (
    <video
      ref={ref}
      key={mediaSrc} // Using key to force re-mount when src changes
      controls
      className="w-full h-full object-contain"
    >
      <source src={mediaSrc} />
      Your browser does not support the video tag.
    </video>
  );
});

VideoMediaPlayer.displayName = 'VideoMediaPlayer';

VideoMediaPlayer.propTypes = {
  mediaSrc: PropTypes.string,
};

export default VideoMediaPlayer;