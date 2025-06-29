import React from 'react';
import PropTypes from 'prop-types';
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
// VectorToChevron might be needed if you use it in POS mode
// import VectorToChevron from '../pose_editor/VectorToChevron'; 

const BeatButton = ({
  barIndex,
  beatIndex,
  isActive,
  isCurrentStep,
  onClick,
  beatData,
  viewMode,
  onDeleteSound,
  onClearPoseData,
}) => {
  const { sounds = [], jointInfo, thumbnail } = beatData || {};
  const hasPoseData = jointInfo && Object.keys(jointInfo).length > 0;
  
  const handleClick = () => onClick(barIndex, beatIndex);

  const handleDeleteSound = (e, soundName) => {
    e.stopPropagation();
    onDeleteSound(barIndex, beatIndex, soundName);
  };

  const handleDeletePose = (e) => {
    e.stopPropagation();
    onClearPoseData(barIndex, beatIndex);
  };

  const beatNumber = beatIndex + 1;

  const baseClasses = 'relative aspect-square w-full rounded-md border-2 p-1 flex flex-col justify-between items-center transition-all duration-100 ease-in-out select-none group';
  const activeClasses = isActive ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-600';
  const playingClasses = isCurrentStep ? 'bg-green-500 scale-105' : 'bg-gray-800/50'; // Simplified for clarity
  const hoverClasses = 'hover:border-yellow-600';
  const combinedClasses = `${baseClasses} ${activeClasses} ${playingClasses} ${hoverClasses}`;
  
  const renderSEQMode = () => (
    <>
      <span className="absolute top-1 left-2 text-xs text-gray-400">{beatIndex + 1}</span>
      <div className="flex flex-col items-center justify-center h-full w-full pt-4 text-center overflow-hidden">
        {sounds.map((soundName) => (
          <div key={soundName} className="relative w-full text-center group/sound">
            <span className="text-xs font-semibold text-brand-seq-light truncate px-1">{soundName}</span>
            <span
              onClick={(e) => handleDeleteSound(e, soundName)}
              role="button"
              tabIndex="0"
              className="absolute -top-1 right-0 p-1 text-red-500 hover:text-red-300 opacity-0 group-hover/sound:opacity-100 transition-opacity cursor-pointer"
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
    const jointKeys = jointInfo ? Object.keys(jointInfo) : [];
    const primaryJointKey = jointKeys.length > 0 ? jointKeys[0] : null;
    const representativeVector = (primaryJointKey && jointInfo[primaryJointKey]?.vector) ? jointInfo[primaryJointKey].vector : { x: 0, y: 0, z: 0 };
    const backgroundStyle = thumbnail ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
    const hasTransition = transition?.poseCurve;

    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center text-pos-yellow-light"
        style={backgroundStyle}
      >
        <span className="absolute top-1 left-2 text-xs text-gray-400 filter drop-shadow-md">{beatNumber}</span>
        
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
        
        {/* [SURGICAL ENHANCEMENT] */}
        {hasTransition && (
            <div className="absolute bottom-1 left-1 text-white/50" title={`Transition: ${hasTransition}`}>
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </div>
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
  viewMode: PropTypes.string.isRequired,
  onDeleteSound: PropTypes.func.isRequired,
  onClearPoseData: PropTypes.func.isRequired,
  beatData: PropTypes.shape({
    sounds: PropTypes.arrayOf(PropTypes.string),
    jointInfo: PropTypes.object,
    grounding: PropTypes.object,
    thumbnail: PropTypes.string,
    transition: PropTypes.object, // Now part of beatData
    isDetectedBeat: PropTypes.bool,
    mediaCuePoint: PropTypes.number,
  }),
};

export default BeatButton;