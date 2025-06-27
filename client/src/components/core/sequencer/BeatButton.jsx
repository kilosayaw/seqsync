import React from 'react';
import PropTypes from 'prop-types';
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faMusic } from '@fortawesome/free-solid-svg-icons';

const BeatButton = ({
  barIndex,
  beatIndex,
  isActive,
  isCurrentStep,
  sounds,
  viewMode,
  hasPoseData,
  thumbnail,
  onClick,
  onAddSound,
  onDeleteLastSound, // Changed from onDeleteSound to match grid handler
  onClearPoseData,
  currentSoundInBank, // Added to pass to onAddSound
}) => {
  const hasSounds = sounds && sounds.length > 0;

  const handleLeftClick = () => {
    // In SEQ mode, a left click adds the current sound.
    if (viewMode === MODES.SEQ) {
      onAddSound(barIndex, beatIndex, currentSoundInBank);
    }
    // In both modes, a left click selects the beat.
    onClick(beatIndex);
  };

  const handleRightClick = (e) => {
    e.preventDefault(); // Prevent browser context menu
    // In SEQ mode, a right click deletes the last added sound.
    if (viewMode === MODES.SEQ && hasSounds) {
      onDeleteLastSound(barIndex, beatIndex); // Call the new specific handler
    }
    // In POS mode, it could have other functionality, like clearing the pose.
    if (viewMode === MODES.POS && hasPoseData) {
      onClearPoseData(barIndex, beatIndex);
    }
  };
  
  // Dynamic classes for styling
  const buttonClasses = `
    relative aspect-square w-full rounded-md border-2 transition-all duration-150
    flex items-center justify-center text-lg font-mono text-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    ${isCurrentStep ? 'border-white scale-105 shadow-lg' : ''}
    ${isActive ? 'border-pos-yellow' : 'border-gray-700 hover:border-gray-500'}
    ${viewMode === MODES.SEQ && hasSounds ? 'bg-brand-seq/30' : 'bg-gray-800/50'}
    ${viewMode === MODES.POS && hasPoseData ? 'bg-pos-yellow/20' : ''}
  `;

  // Display sound count if more than one sound is present
  const soundIndicator = hasSounds && (
    <div className={`absolute bottom-0.5 right-1 text-brand-seq flex items-center gap-0.5 ${sounds.length > 1 ? 'bg-black/50 px-1 rounded-sm' : ''}`}>
      <FontAwesomeIcon icon={faMusic} size="xs" />
      {sounds.length > 1 && <span className="text-xxs font-sans font-bold">{sounds.length}</span>}
    </div>
  );

  return (
    <button
      className={buttonClasses}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
      title={viewMode === MODES.SEQ ? `Left-click to add '${currentSoundInBank}', Right-click to remove last` : 'Select beat'}
    >
      {thumbnail && <img src={thumbnail} alt="Pose thumbnail" className="absolute inset-0 w-full h-full object-cover rounded-sm" />}
      
      <div className={`z-10 flex flex-col items-center justify-center transition-opacity duration-200 ${thumbnail ? 'opacity-0 hover:opacity-100 bg-black/60 w-full h-full' : 'opacity-100'}`}>
         {/* You can display beat index or other info here */}
      </div>

      {soundIndicator}
      
      {viewMode === MODES.POS && hasPoseData && (
        <div
          className="absolute top-1 right-1 z-20 p-1 rounded-full bg-red-600/70 hover:bg-red-500 text-white cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClearPoseData(barIndex, beatIndex);
          }}
          title="Clear Pose Data"
        >
          <FontAwesomeIcon icon={faTrashAlt} className="h-2 w-2" />
        </div>
      )}
    </button>
  );
};

BeatButton.propTypes = {
  barIndex: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  sounds: PropTypes.arrayOf(PropTypes.string),
  viewMode: PropTypes.oneOf(Object.values(MODES)).isRequired,
  hasPoseData: PropTypes.bool.isRequired,
  thumbnail: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onAddSound: PropTypes.func.isRequired,
  onDeleteLastSound: PropTypes.func.isRequired,
  onClearPoseData: PropTypes.func.isRequired,
  currentSoundInBank: PropTypes.string,
};

export default BeatButton;