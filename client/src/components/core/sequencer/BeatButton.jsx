// src/components/core/sequencer/BeatButton.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import VectorToChevron from '../pose_editor/VectorToChevron';

const BeatButton = ({
  barIndex,
  beatIndex,
  isActive,
  isCurrentStep,
  onClick,
  sounds = [],
  viewMode,
  hasPoseData,
  poseData,
  grounding,
  thumbnail,
  onDeleteSound,
  onClearPoseData, // <<< NEW PROP for deleting pose data
}) => {

  const handleClick = () => onClick(barIndex, beatIndex);

  const handleDeleteSound = (e, soundName) => {
    e.stopPropagation(); // Prevent the main button click
    onDeleteSound(barIndex, beatIndex, soundName);
  };

  const handleDeletePose = (e) => {
    e.stopPropagation(); // Prevent the main button click
    onClearPoseData(barIndex, beatIndex);
  };

  const beatNumber = beatIndex + 1;

  // Base classes
  const baseClasses = 'relative aspect-square w-full rounded-md border-2 p-1.5 flex flex-col justify-between items-center transition-all duration-100 ease-in-out select-none group';
  
  // Dynamic classes
  const activeClasses = isActive ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/30' : 'border-gray-600';
  const playingClasses = isCurrentStep ? 'bg-green-500 scale-105' : (hasPoseData ? 'bg-blue-900/50' : 'bg-gray-800/50');
  const hoverClasses = 'hover:border-yellow-600';

  const combinedClasses = `${baseClasses} ${activeClasses} ${playingClasses} ${hoverClasses}`;
  
  const renderSEQMode = () => (
    <>
      <span className="absolute top-1 left-2 text-xs text-gray-400">{beatNumber}</span>
      <div className="flex flex-col items-center justify-center h-full w-full pt-4 text-center">
        {sounds.map((soundName) => (
          <div key={soundName} className="relative w-full text-center group/sound">
            <span className="text-xs font-semibold text-brand-seq-light truncate">{soundName}</span>
            {/* === FIX: Changed <button> to <span> for valid HTML === */}
            <span
              onClick={(e) => handleDeleteSound(e, soundName)}
              role="button"
              tabIndex="0"
              className="absolute -top-1 -right-1 p-1 text-red-500 hover:text-red-300 opacity-0 group-hover/sound:opacity-100 transition-opacity cursor-pointer"
              aria-label={`Delete ${soundName}`}
            >
              <FontAwesomeIcon icon={faTimes} size="xs" />
            </span>
          </div>
        ))}
      </div>
    </>
  );

  const renderPOSMode = () => {
    const jointKeys = poseData ? Object.keys(poseData) : [];
    const primaryJointKey = jointKeys.length > 0 ? jointKeys[0] : null;
    const representativeVector = (primaryJointKey && poseData[primaryJointKey]?.vector)
      ? poseData[primaryJointKey].vector
      : { x: 0, y: 0, z: 0 };
    
    const backgroundStyle = thumbnail 
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      : {};

    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center text-pos-yellow-light"
        style={backgroundStyle}
      >
        <span className="absolute top-1 left-2 text-xs text-gray-400 filter drop-shadow-md">{beatNumber}</span>
        
        {/* === NEW: Delete Pose Button === */}
        {hasPoseData && (
          <span
            onClick={handleDeletePose}
            role="button"
            tabIndex="0"
            className="absolute top-0 right-0 p-1.5 text-red-500 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            aria-label="Clear Pose Data"
          >
            <FontAwesomeIcon icon={faTrashAlt} size="sm" />
          </span>
        )}

        {hasPoseData && primaryJointKey ? (
          <div className="flex flex-col items-center justify-center text-center filter drop-shadow-lg">
            <span className="font-bold text-lg text-white">{primaryJointKey}</span>
            <VectorToChevron vector={representativeVector} className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
        )}

        {grounding && (grounding.L || grounding.R) && (
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-cyan-400 border border-black/50" title="Grounded"></div>
        )}
      </div>
    );
  };
  
  return (
    <button onClick={handleClick} className={combinedClasses} aria-pressed={isActive}>
      {viewMode === MODES.SEQ ? renderSEQMode() : renderPOSMode()}
    </button>
  );
};

BeatButton.propTypes = {
  barIndex: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  sounds: PropTypes.arrayOf(PropTypes.string),
  viewMode: PropTypes.string.isRequired,
  hasPoseData: PropTypes.bool,
  poseData: PropTypes.object,
  grounding: PropTypes.object,
  thumbnail: PropTypes.string,
  onDeleteSound: PropTypes.func.isRequired,
  onClearPoseData: PropTypes.func.isRequired, // <<< ADD NEW PROP TYPE
  // Unused props removed for cleanliness
  // currentSoundInBank: PropTypes.string,
  // onAddSound: PropTypes.func.isRequired,
};

export default BeatButton;