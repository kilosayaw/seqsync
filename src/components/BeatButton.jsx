import React from 'react';
import './BeatButton.css';

const BeatButton = ({ beatIndex, isActive, isSelected, onClick }) => {

  // Dynamically build the className string based on props
  const getButtonClasses = () => {
    let classes = 'beat-button';
    if (isActive) {
      classes += ' active';
    }
    if (isSelected) {
      classes += ' selected';
    }
    return classes;
  };

  return (
    <button className={getButtonClasses()} onClick={() => onClick(beatIndex)}>
      {/* For now, just display the beat number */}
      <div className="beat-number">{beatIndex + 1}</div>
      
      {/* We will add waveform and thumbnail overlays here in a future step */}
    </button>
  );
};

export default BeatButton;