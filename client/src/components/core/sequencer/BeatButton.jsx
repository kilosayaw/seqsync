import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MODES } from '../../../utils/constants';
import Button from '../../common/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const BeatButton = ({
  barIndex, beatIndex, isActive, isCurrentStep, onClick,
  sounds = [], viewMode, hasPoseData, thumbnail, onClearPoseData,
  currentSoundInBank, onAddSound, onDeleteSound
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddClick = (e) => {
    e.stopPropagation(); // Prevent the beat from being selected
    if (currentSoundInBank) {
      onAddSound(barIndex, beatIndex, currentSoundInBank);
    }
  };
  
  const handleDeleteClick = (e, soundName) => {
    e.stopPropagation(); // Prevent the beat from being selected
    onDeleteSound(barIndex, beatIndex, soundName);
  };

  const baseClasses = "relative w-full aspect-square rounded-md border-2 transition-all duration-150 flex items-center justify-center p-1 text-xs";
  const activeClasses = isActive ? "border-pos-yellow shadow-lg shadow-pos-yellow/20" : "border-gray-600 hover:border-gray-500";
  const playingClasses = isCurrentStep ? "bg-green-500/50" : "bg-gray-800/50";
  
  const canAddSound = isHovered && currentSoundInBank && sounds.length < 4 && !sounds.includes(currentSoundInBank);

  return (
    <div
      onClick={() => onClick(barIndex, beatIndex)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${activeClasses} ${playingClasses} cursor-pointer group`}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={`Pose for B${barIndex+1}S${beatIndex+1}`} className="absolute inset-0 w-full h-full object-cover rounded-sm opacity-40 group-hover:opacity-60" />
      ) : hasPoseData && (
        <div className="absolute w-2.5 h-2.5 bg-pos-yellow rounded-full opacity-70" />
      )}
      
      <span className="relative z-10 text-gray-400">{beatIndex + 1}</span>

      {viewMode === MODES.SEQ && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-start gap-0.5 p-0.5 overflow-hidden">
          {sounds.map(sound => (
            <div key={sound} className="relative w-full flex items-center justify-center text-[10px] bg-brand-seq/80 text-white rounded-[2px] px-1 group/sound">
              <span className="truncate">{sound}</span>
              <button
                onClick={(e) => handleDeleteClick(e, sound)}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 p-0.5 text-red-300 opacity-0 group-hover/sound:opacity-100 hover:text-red-100"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
          {canAddSound && (
            <div className="w-full mt-auto p-0.5">
                <Button
                    onClick={handleAddClick}
                    variant="custom"
                    size="xs"
                    className="w-full h-full bg-green-500/80 hover:bg-green-500 text-white"
                    iconLeft={faPlus}
                />
            </div>
          )}
        </div>
      )}
    </div>
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
  onClearPoseData: PropTypes.func.isRequired,
};

export default BeatButton;