import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faUserNinja } from '@fortawesome/free-solid-svg-icons';
import { MODES, UI_PADS_PER_BAR } from '../../../utils/constants';
import { unlockAudioContext } from '../../../utils/audioManager';
import TransitionIndicator from './TransitionIndicator';
import BeatWaveform from './BeatWaveform'; 

const SoundTag = ({ soundName, onDelete }) => (
    <div className="relative group text-xs bg-brand-seq/80 text-white rounded px-2 py-0.5 shadow-md">
        {soundName === 'HIT' ? 'Hit' : soundName}
        <div 
            onClick={onDelete}
            className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded"
            title={`Delete ${soundName}`}
        >
            <FontAwesomeIcon icon={faTrashAlt} />
        </div>
    </div>
);
SoundTag.propTypes = { soundName: PropTypes.string.isRequired, onDelete: PropTypes.func.isRequired };

const BeatButton = ({
  beatData,
  barIndex,
  beatIndex,
  isActive,
  isCurrentStep,
  isRecording,
  viewMode,
  onClick,
  onAddSound,
  onDeleteSound,
  onClearPoseData,
  currentSoundInBank,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasSounds = beatData.sounds && beatData.sounds.length > 0;
  const hasMovementData = beatData.jointInfo && Object.keys(beatData.jointInfo).length > 0;
  const hasWaveform = beatData.waveform && beatData.waveform.length > 0;
  const hasVideoThumbnail = !!beatData.videoThumbnail;
  const hasManualThumbnail = !!beatData.thumbnail;
  const canAddSound = viewMode === MODES.SEQ && beatData.sounds?.length < 4 && currentSoundInBank;

  const handleMainClick = () => {
    unlockAudioContext();
    onClick(beatIndex);
  };
  
  const handleAddClick = (e) => {
    e.stopPropagation();
    if (canAddSound) onAddSound();
  };

  const handleClearPoseClick = (e) => {
    e.stopPropagation();
    onClearPoseData(barIndex, beatIndex);
  };

  const buttonClasses = `
    relative w-full h-full rounded-lg border-2 transition-all duration-150
    flex items-center justify-center text-lg font-mono text-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 overflow-hidden
    ${isCurrentStep ? 'border-white scale-105 shadow-lg' : 'border-gray-700'}
    ${isActive ? 'border-pos-yellow' : 'hover:border-gray-500'}
    ${(viewMode === MODES.POS && (hasMovementData || hasVideoThumbnail)) ? 'bg-pos-yellow/20' : ''}
    ${(viewMode === MODES.SEQ && (hasSounds || hasWaveform)) ? 'bg-brand-seq/30' : 'bg-gray-800/50'}
  `;

  const renderContent = () => {
    if (viewMode === MODES.POS) {
        if (hasVideoThumbnail) return <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${beatData.videoThumbnail})` }} />;
        if (hasManualThumbnail) return <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${beatData.thumbnail})` }} />;
        if (hasMovementData) return <FontAwesomeIcon icon={faUserNinja} className="text-pos-yellow/50 text-2xl" />;
    }
    if (viewMode === MODES.SEQ) {
        if (hasWaveform) return <BeatWaveform points={beatData.waveform} />;
        if (hasSounds) return (
            <div className="absolute inset-0 z-10 flex flex-wrap items-center justify-center gap-1 p-1">
                {beatData.sounds.map(sound => (
                    <SoundTag key={sound} soundName={sound} onDelete={(e) => { e.stopPropagation(); onDeleteSound(barIndex, beatIndex, sound); }} />
                ))}
            </div>
        );
    }
    return <span className="text-white text-lg font-bold">{beatIndex + 1}</span>;
  };

  const canHaveTransition = beatIndex < UI_PADS_PER_BAR - 1;
  const transitionCurveType = viewMode === MODES.SEQ ? beatData.transition?.soundCurve : beatData.transition?.poseCurve;

  return (
    // --- DEFINITIVE FIX: Removed fixed height. This container now fills its parent grid cell. ---
    <div className="relative w-full h-full flex items-center">
        <button
            className={buttonClasses + " aspect-square"}
            onClick={handleMainClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={`Beat ${beatIndex + 1}`}
        >
            {renderContent()}
            
            {isHovered && canAddSound && (
                <div onClick={handleAddClick} className="absolute bottom-1 left-1 w-6 h-6 bg-green-500/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-500 hover:scale-110 transition-all z-30" title={`Add ${currentSoundInBank}`}>
                    <FontAwesomeIcon icon={faPlus} size="xs" />
                </div>
            )}
            
            {isRecording && isCurrentStep && <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping z-30" />}
            
            {viewMode === MODES.POS && hasMovementData && (
                <div onClick={handleClearPoseClick} className="absolute top-1 right-1 z-30 p-1 rounded-full bg-red-600/70 hover:bg-red-500 text-white cursor-pointer opacity-50 hover:opacity-100 transition-opacity" title="Clear Pose Data">
                    <FontAwesomeIcon icon={faTrashAlt} className="h-2 w-2" />
                </div>
            )}
        </button>
        
        {canHaveTransition && (
            <TransitionIndicator 
                beatIndex={beatIndex} 
                curveType={transitionCurveType}
                targetMode={viewMode}
            />
        )}
    </div>
  );
};

BeatButton.propTypes = {
  beatData: PropTypes.object.isRequired,
  barIndex: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  viewMode: PropTypes.oneOf(Object.values(MODES)).isRequired,
  onClick: PropTypes.func.isRequired,
  onAddSound: PropTypes.func.isRequired,
  onDeleteSound: PropTypes.func.isRequired,
  onClearPoseData: PropTypes.func.isRequired,
  currentSoundInBank: PropTypes.string,
};

export default BeatButton;