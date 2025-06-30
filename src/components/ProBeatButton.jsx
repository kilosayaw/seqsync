import React from 'react';
import PoseThumbnail from './PoseThumbnail';
import './ProBeatButton.css';

const ProBeatButton = ({ beatIndex, beatData, isActive, isSelected, onClick, onDoubleClick }) => {
  
  // THIS FUNCTION IS RESTORED TO PREVENT THE CRASH
  const getButtonClasses = () => {
    let classes = 'pro-beat-button';
    if (isActive) {
      classes += ' active';
    }
    if (isSelected) {
      classes += ' selected';
    }
    if (beatData && beatData.poseData) {
      classes += ' has-data';
    }
    return classes;
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {beatData && beatData.poseData ? (
        <PoseThumbnail poseData={beatData.poseData} />
      ) : (
        <span className="pro-beat-number">{beatIndex + 1}</span>
      )}
    </button>
  );
};

export default ProBeatButton;