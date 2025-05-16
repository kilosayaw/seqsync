import React from 'react';

const NotationTimelineGrid = ({ bpm, timeSignature, durationMs, width }) => {
  if (!bpm || !durationMs || !width) return null;

  const msPerBeat = 60000 / bpm;
  const totalBeats = Math.floor(durationMs / msPerBeat);
  const pixelsPerMs = width / durationMs;

  const bars = [];

  for (let i = 0; i <= totalBeats; i++) {
    const isBar = i % timeSignature === 0;
    const left = i * msPerBeat * pixelsPerMs;

    bars.push(
      <div
        key={i}
        className={`absolute top-0 bottom-0 ${
          isBar ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        style={{
          left: `${left}px`,
          width: '1px',
          opacity: isBar ? 0.8 : 0.4,
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bars}
    </div>
  );
};

export default NotationTimelineGrid;
