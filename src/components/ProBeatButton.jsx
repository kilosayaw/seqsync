import React from 'react';
import './ProBeatButton.css';

const ProBeatButton = ({ beatIndex, isActive, isSelected, onClick }) => {
  const getButtonClasses = () => {
    let classes = 'pro-beat-button';
    if (isActive) classes += ' active';
    if (isSelected) classes += ' selected';
    return classes;
  };

  return (
    <button className={getButtonClasses()} onClick={() => onClick(beatIndex)}>
      {/* We can add waveform/thumbnail data here later */}
      <span className="pro-beat-number">{beatIndex + 1}</span>
    </button>
  );
};

export default ProBeatButton;