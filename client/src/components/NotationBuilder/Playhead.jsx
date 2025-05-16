import React from 'react';

const Playhead = ({ currentTime, durationMs, containerWidth }) => {
  if (!durationMs || !containerWidth) return null;

  const percent = currentTime / durationMs;
  const left = Math.min(containerWidth * percent, containerWidth);

  return (
    <div
      className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none z-10"
      style={{ left: `${left}px` }}
    />
  );
};

export default Playhead;
