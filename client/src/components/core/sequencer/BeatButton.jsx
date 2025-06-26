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
  onDeleteLastSound,
  onClearPoseData,
  currentSoundInBank,
}) => {
  const hasSounds = sounds && sounds.length > 0;

  const handleLeftClick = () => {
    if (viewMode === MODES.SEQ && currentSoundInBank) {
      onAddSound(barIndex, beatIndex, currentSoundInBank);
    }
    onClick(beatIndex);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (viewMode === MODES.SEQ && hasSounds) {
      onDeleteLastSound(barIndex, beatIndex);
    }
    if (viewMode === MODES.POS && hasPoseData) {
      onClearPoseData(barIndex, beatIndex);
    }
  };
  
  // Dynamic classes for styling
  const buttonClasses = `
    relative aspect-square w-full rounded-md border-2 transition-all duration-150
    flex items-center justify-center text-lg font-mono text-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 overflow-hidden
    ${isCurrentStep ? 'border-white scale-105 shadow-lg' : 'border-gray-700'}
    ${isActive ? 'border-pos-yellow' : 'hover:border-gray-500'}
    ${viewMode === MODES.SEQ && hasSounds ? 'bg-brand-seq/30' : 'bg-gray-800/50'}
    ${viewMode === MODES.POS && hasPoseData ? 'bg-pos-yellow/20' : ''}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
      title={viewMode === MODES.SEQ ? `Left-click to add '${currentSoundInBank}', Right-click to remove last` : 'Select beat'}
    >
      {/* --- REFINED THUMBNAIL DISPLAY --- */}
      {/* Using a div with background-image for better scaling and control */}
      {thumbnail && (
          <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-200"
              style={{ backgroundImage: `url(${thumbnail})` }}
              aria-label="Pose thumbnail"
          />
      )}
      
      {/* Overlay to show beat number on hover (optional enhancement) */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${thumbnail ? 'opacity-0 hover:opacity-100' : 'opacity-100'} bg-black/50`}>
        <span className="text-white text-xl font-bold">{beatIndex + 1}</span>
      </div>

      {/* Sound Indicator */}
      {hasSounds && (
        <div className="absolute bottom-1 right-1 z-20 text-brand-seq flex items-center gap-1 bg-black/60 px-1.5 rounded-sm">
          <FontAwesomeIcon icon={faMusic} className="h-2 w-2" />
          {sounds.length > 1 && <span className="text-xs font-sans">{sounds.length}</span>}
        </div>
      )}
      
      {/* Clear Pose Button */}
      {viewMode === MODES.POS && hasPoseData && (
        <div
          className="absolute top-1 right-1 z-20 p-1 rounded-full bg-red-600/70 hover:bg-red-500 text-white cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the main button click
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
  // Your PropTypes are excellent and remain unchanged
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