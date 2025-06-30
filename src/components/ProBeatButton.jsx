import React from 'react';
import './ProBeatButton.css';

// Helper function to convert waveform data into an SVG path string
const getWaveformPath = (waveform, width, height) => {
  if (!waveform || waveform.length === 0) return '';
  
  const step = width / waveform.length;
  const amp = height / 2;

  let path = `M 0 ${amp}`;
  
  for (let i = 0; i < waveform.length; i++) {
    const x = i * step;
    const y = waveform[i] * amp + amp;
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  
  return path;
};


const ProBeatButton = ({ beatIndex, isActive, isSelected, onClick, waveform }) => {
  const getButtonClasses = () => {
    let classes = 'pro-beat-button';
    if (isActive) classes += ' active';
    if (isSelected) classes += ' selected';
    return classes;
  };
  
  const waveformPath = getWaveformPath(waveform, 60, 40); // width/height for SVG

  return (
    <button className={getButtonClasses()} onClick={() => onClick(beatIndex)}>
      {waveformPath && (
        <svg 
          className="waveform-svg"
          viewBox="0 0 60 40"
          preserveAspectRatio="none"
        >
          <path d={waveformPath} />
        </svg>
      )}
      <span className="pro-beat-number">{beatIndex + 1}</span>
    </button>
  );
};

export default ProBeatButton;