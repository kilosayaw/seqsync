// client/src/components/NotationBuilder/TimelineCanvas.jsx
import React, { useRef, useEffect } from 'react';

const TimelineCanvas = ({ currentTime, durationMs, bpm, timeSignature, notations = [], onSeek }) => {
  const canvasRef = useRef(null);

  const msPerBeat = 60000 / bpm;
  const beatsPerBar = timeSignature;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 60;
    ctx.clearRect(0, 0, width, height);

    // Draw bar/beat markers
    const totalBeats = durationMs / msPerBeat;
    const pixelsPerMs = width / durationMs;

    for (let i = 0; i <= totalBeats; i++) {
      const x = i * msPerBeat * pixelsPerMs;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, i % beatsPerBar === 0 ? height : height / 2);
      ctx.strokeStyle = i % beatsPerBar === 0 ? '#222' : '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ⬅️ Draw notation markers
    notations.forEach((note) => {
      const markerX = note.ms * pixelsPerMs;
      ctx.fillStyle = '#c2410c'; // Orange
      ctx.fillRect(markerX - 1, height - 12, 2, 12);
    });

    // 🔴 Draw playhead
    const playheadX = currentTime * pixelsPerMs;
    ctx.fillStyle = 'red';
    ctx.fillRect(playheadX - 1, 0, 2, height);
  }, [currentTime, durationMs, bpm, timeSignature, notations]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full border shadow-sm rounded cursor-pointer"
      height={60}
      onClick={(e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newMs = (x / rect.width) * durationMs;
        onSeek?.(newMs);
      }}
    />
  );
};

export default TimelineCanvas;
