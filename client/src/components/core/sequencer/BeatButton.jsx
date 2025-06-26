// src/components/core/sequencer/BeatButton.jsx
// Full updated version with intended styling for sound names.

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faBroadcastTower } from '@fortawesome/free-solid-svg-icons';
import { getSoundNameFromPath, tr808SoundFiles } from '../../../utils/sounds';
import Tooltip from '../../common/Tooltip';
import { toast } from 'react-toastify';
import {
  MODE_SEQ, MODE_POS, MAX_SOUNDS_PER_BEAT, createDefaultBeatObject,
  DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
  DEFAULT_JOINT_ENERGY, DEFAULT_INTENT, DEFAULT_GENERAL_ORIENTATION,
} from '../../../utils/constants';

const BeatButton = React.memo(({
  beatData, beatIndex, appMode, isSelectedForEdit, isCurrentlySelectedInSeqMode,
  isCurrentlyPlayingAtBeat, isPlayheadPositionWhenPaused,
  onClick, onAddSound, onDeleteSound, currentSoundInBank, logToConsole,
}) => {
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [hoveredSoundKey, setHoveredSoundKey] = useState(null);

  useEffect(() => {
    logToConsole?.(`[BeatButton ${beatIndex + 1}] Render/Update. beatData.sounds:`, JSON.stringify(beatData?.sounds));
  }, [beatData, beatIndex, logToConsole]);

  const currentBeatData = useMemo(() => {
    const defaultBeat = createDefaultBeatObject(beatIndex);
    let finalData = { ...defaultBeat, id: beatIndex };
    if (beatData && typeof beatData === 'object') {
      finalData = { ...finalData, ...beatData,
        sounds: Array.isArray(beatData.sounds) ? beatData.sounds : [],
        jointInfo: (typeof beatData.jointInfo === 'object' && beatData.jointInfo !== null) ? beatData.jointInfo : {},
        grounding: (typeof beatData.grounding === 'object' && beatData.grounding !== null) ? beatData.grounding : { L: null, R: null, L_weight: 50 },
        mediaCuePoint: beatData.mediaCuePoint !== undefined ? beatData.mediaCuePoint : null,
      };
    }
    return finalData;
  }, [beatData, beatIndex]);

  const { sounds, jointInfo, grounding, mediaCuePoint } = currentBeatData;

  const handleClick = useCallback(() => {
    logToConsole?.(`[BeatButton ${beatIndex + 1}] Clicked. AppMode: ${appMode}`);
    onClick(beatIndex);
  }, [onClick, beatIndex, appMode, logToConsole]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logToConsole?.(`[BeatButton ${beatIndex + 1}] KeyPressed (${e.key}). AppMode: ${appMode}`);
      onClick(beatIndex);
    }
  }, [onClick, beatIndex, appMode, logToConsole]);

  const handleAddSoundClickInternal = useCallback((e) => {
    e.stopPropagation();
    logToConsole?.(`[BeatButton ${beatIndex + 1}] AddSoundClickInternal. SoundInBank: ${currentSoundInBank}, SoundsOnBeat: ${sounds?.length}`);
    if (onAddSound && currentSoundInBank && (!sounds || sounds.length < MAX_SOUNDS_PER_BEAT)) {
      onAddSound(beatIndex);
    } else if (sounds && sounds.length >= MAX_SOUNDS_PER_BEAT) {
      toast.warn(`Max ${MAX_SOUNDS_PER_BEAT} sounds per beat.`);
    } else if (!currentSoundInBank) {
      toast.info("No sound selected in bank to add.");
    }
  }, [onAddSound, currentSoundInBank, sounds, beatIndex, logToConsole]);

  const handleDeleteSoundClickInternal = useCallback((e, soundKey) => {
    e.stopPropagation();
    logToConsole?.(`[BeatButton ${beatIndex + 1}] DeleteSoundClickInternal. SoundKey: ${soundKey}`);
    if (onDeleteSound) onDeleteSound(beatIndex, soundKey);
  }, [onDeleteSound, beatIndex, logToConsole]);

  const hasSoundData = useMemo(() => sounds && sounds.length > 0, [sounds]);
  const hasMeaningfulJointData = useMemo(() => Object.values(jointInfo || {}).some(details => details && typeof details === 'object' && ((details.rotation !== undefined && parseFloat(details.rotation) !== 0) || (details.orientation && details.orientation !== DEFAULT_GENERAL_ORIENTATION) || (details.vector && (details.vector.x !== 0 || details.vector.y !== 0 || details.vector.z !== 0)) || (details.intent && details.intent !== DEFAULT_INTENT) || (details.energy !== undefined && parseFloat(details.energy) !== DEFAULT_JOINT_ENERGY) || (details.orientation_sagittal && details.orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) || (details.orientation_frontal && details.orientation_frontal !== DEFAULT_ANKLE_FRONTAL) || (details.orientation_transverse && details.orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE))), [jointInfo]);
  const hasGroundingData = useMemo(() => (grounding?.L && grounding.L.length > 0) || (grounding?.R && grounding.R.length > 0) || (grounding?.L_weight !== undefined && grounding.L_weight !== 50), [grounding]);
  const hasMediaCueData = useMemo(() => mediaCuePoint !== null && mediaCuePoint !== undefined, [mediaCuePoint]);
  const hasAnyProgrammedData = useMemo(() => hasSoundData || hasMeaningfulJointData || hasGroundingData || hasMediaCueData, [hasSoundData, hasMeaningfulJointData, hasGroundingData, hasMediaCueData]);

  const textAndIconColorClass = useMemo(() => (isSelectedForEdit && appMode === MODE_POS) ? "text-black font-semibold" : (isCurrentlySelectedInSeqMode && appMode === MODE_SEQ) ? "text-white" : hasAnyProgrammedData ? "text-gray-100" : "text-gray-400", [isSelectedForEdit, appMode, isCurrentlySelectedInSeqMode, hasAnyProgrammedData]);
  const primaryJointDisplayAbbrev = useMemo(() => { if (appMode === MODE_POS && hasMeaningfulJointData) { const jointInfoToParse = jointInfo || {}; const firstSigJoint = Object.keys(jointInfoToParse).find(k => jointInfoToParse[k] && typeof jointInfoToParse[k]==='object' && ( (jointInfoToParse[k].vector&&(jointInfoToParse[k].vector.x!==0||jointInfoToParse[k].vector.y!==0||jointInfoToParse[k].vector.z!==0)) || (jointInfoToParse[k].rotation!==undefined&&parseFloat(jointInfoToParse[k].rotation)!==0) || (jointInfoToParse[k].orientation&&jointInfoToParse[k].orientation!==DEFAULT_GENERAL_ORIENTATION) || (jointInfoToParse[k].orientation_sagittal&&jointInfoToParse[k].orientation_sagittal!==DEFAULT_ANKLE_SAGITTAL) || (jointInfoToParse[k].orientation_frontal&&jointInfoToParse[k].orientation_frontal!==DEFAULT_ANKLE_FRONTAL) || (jointInfoToParse[k].orientation_transverse&&jointInfoToParse[k].orientation_transverse!==DEFAULT_ANKLE_TRANSVERSE) || (jointInfoToParse[k].intent&&jointInfoToParse[k].intent!==DEFAULT_INTENT) || (jointInfoToParse[k].energy!==undefined&&parseFloat(jointInfoToParse[k].energy)!==DEFAULT_JOINT_ENERGY) )) || Object.keys(jointInfoToParse)[0]; return firstSigJoint ? firstSigJoint.substring(0,4).replace('_','') : null; } return null; }, [appMode, hasMeaningfulJointData, jointInfo]);
  
  const canAddSound = useMemo(() => appMode === MODE_SEQ && currentSoundInBank && (!sounds || sounds.length < MAX_SOUNDS_PER_BEAT), [appMode, currentSoundInBank, sounds]);
  const showAddSoundHint = useMemo(() => appMode === MODE_SEQ && !currentSoundInBank && (!sounds || sounds.length < MAX_SOUNDS_PER_BEAT), [appMode, currentSoundInBank, sounds]);

  const padSizeClasses = "w-full h-full";
  const buttonClasses = useMemo(() => `relative ${padSizeClasses} rounded flex flex-col items-center justify-start pt-1 pb-1 px-0.5 transition-all duration-150 ease-in-out focus:outline-none font-mono text-[0.6rem] shadow-md hover:shadow-lg overflow-hidden cursor-pointer ${isCurrentlyPlayingAtBeat ? "ring-[3px] ring-offset-1 ring-offset-gray-800 ring-white animate-pulse-border-white shadow-lg z-10" : isPlayheadPositionWhenPaused ? "ring-2 ring-offset-1 ring-offset-gray-800 ring-gray-300 shadow-md" : ""} ${isSelectedForEdit && appMode === MODE_POS ? "bg-brand-pos/70 ring-2 ring-brand-pos shadow-lg scale-105 z-20" : isCurrentlySelectedInSeqMode && appMode === MODE_SEQ ? "bg-brand-seq/60 ring-2 ring-brand-seq shadow-md" : ""} ${hasAnyProgrammedData ? "bg-gray-700/70" : "bg-gray-800/60"} ${!(isSelectedForEdit && appMode === MODE_POS) && !(isCurrentlySelectedInSeqMode && appMode === MODE_SEQ) && !isCurrentlyPlayingAtBeat && !isPlayheadPositionWhenPaused ? (hasAnyProgrammedData ? "hover:bg-gray-600/80" : "hover:bg-gray-700/70") : ""}`, [isCurrentlyPlayingAtBeat, isPlayheadPositionWhenPaused, isSelectedForEdit, appMode, isCurrentlySelectedInSeqMode, hasAnyProgrammedData, padSizeClasses]);
  const beatNumberColorClass = useMemo(() => isCurrentlyPlayingAtBeat ? "text-white font-bold" : (isSelectedForEdit && appMode === MODE_POS) ? "text-yellow-900 font-bold" : (isCurrentlySelectedInSeqMode && appMode === MODE_SEQ) ? "text-blue-100 font-bold" : isPlayheadPositionWhenPaused ? "text-gray-300" : "text-gray-500", [isCurrentlyPlayingAtBeat, isSelectedForEdit, appMode, isCurrentlySelectedInSeqMode, isPlayheadPositionWhenPaused]);

  return (
    <div
      className={`w-full h-full group/beatbutton aspect-square`}
      onMouseEnter={() => setIsHoveringButton(true)}
      onMouseLeave={() => { setIsHoveringButton(false); setHoveredSoundKey(null); }}
    >
      <div
        role="button" tabIndex={0} className={buttonClasses} onClick={handleClick} onKeyPress={handleKeyPress}
        aria-pressed={isSelectedForEdit || isCurrentlySelectedInSeqMode}
        aria-label={`Beat ${beatIndex + 1}. Status: ${hasAnyProgrammedData ? 'Programmed' : 'Empty'}.`}
      >
        <span className={`absolute top-0.5 left-1 text-[0.5rem] sm:text-[0.6rem] font-bold ${beatNumberColorClass} opacity-80 select-none`}>
          {beatIndex + 1}
        </span>
        {hasMediaCueData && ( <Tooltip content={`Media Cue @ ${parseFloat(mediaCuePoint || 0).toFixed(2)}s`} placement="top" wrapperElementType="span"> <FontAwesomeIcon icon={faBroadcastTower} className="absolute top-1 right-1 text-[0.6rem] text-brand-sync/80" /> </Tooltip> )}
        
        <div className="flex-grow w-full flex flex-col items-center justify-center px-0.5 space-y-0.5 overflow-hidden mt-1.5 mb-1.5">
          {appMode === MODE_POS && primaryJointDisplayAbbrev ? (
            <span className={`text-xs sm:text-sm font-bold truncate px-0.5 ${isSelectedForEdit ? 'text-yellow-900' : 'text-yellow-400'}`}>
              {primaryJointDisplayAbbrev}
            </span>
          ) : (
            sounds && sounds.slice(0, MAX_SOUNDS_PER_BEAT).map((soundKey, index) => (
              <div 
                key={`${soundKey}-${index}-${beatIndex}`} 
                className="relative group/sounditem w-full max-w-[90%] my-px flex items-center justify-center"
                onMouseEnter={() => {if (appMode === MODE_SEQ) setHoveredSoundKey(soundKey);}}
                onMouseLeave={() => {if (appMode === MODE_SEQ) setHoveredSoundKey(null);}}
              >
                <p 
                  className={`truncate text-center text-[0.6rem] sm:text-xs leading-tight py-0.5 px-1 rounded-sm w-full transition-colors font-digital-play ${textAndIconColorClass} ${isCurrentlySelectedInSeqMode && appMode === MODE_SEQ ? 'bg-brand-seq/40' : hasAnyProgrammedData ? 'bg-gray-600/50 group-hover/sounditem:bg-gray-500/60' : 'bg-gray-700/50 group-hover/sounditem:bg-gray-600/60'} group-hover/sounditem:opacity-70`}
                  title={getSoundNameFromPath(tr808SoundFiles[soundKey] || soundKey)}
                >
                  {getSoundNameFromPath(tr808SoundFiles[soundKey] || soundKey).substring(0, 6)}
                </p>
                {/* Delete Sound Button - X appears on hover of sound item and if main button is hovered */}
                {appMode === MODE_SEQ && isHoveringButton && hoveredSoundKey === soundKey && ( 
                <Tooltip content={`Delete ${getSoundNameFromPath(tr808SoundFiles[soundKey] || soundKey)}`} placement="right" wrapperElementType="span" delay={0}>
                  <button 
                    type="button" 
                    onClick={(e) => handleDeleteSoundClickInternal(e, soundKey)} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[110%] w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[0.5rem] shadow-md z-50 opacity-0 group-hover/sounditem:opacity-100 transition-opacity" 
                    aria-label={`Remove ${getSoundNameFromPath(tr808SoundFiles[soundKey] || soundKey)}`}> 
                      <FontAwesomeIcon icon={faTimes} /> 
                  </button> 
                </Tooltip> 
                )}
              </div>
            ))
          )}
        </div>

        {appMode === MODE_SEQ && isHoveringButton && canAddSound && (
          <Tooltip content={`Add ${currentSoundInBank ? getSoundNameFromPath(tr808SoundFiles[currentSoundInBank] || currentSoundInBank) : 'sound'}`} placement="bottom" wrapperElementType="span" delay={0}>
            <button type="button" onClick={handleAddSoundClickInternal} className="absolute bottom-1 left-1 w-4 h-4 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow-md z-30 opacity-100 transition-opacity" aria-label="Add selected sound"> 
              <FontAwesomeIcon icon={faPlus} className="text-[0.5rem]" /> 
            </button> 
          </Tooltip>
        )}
        {appMode === MODE_SEQ && isHoveringButton && showAddSoundHint && (
           <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-gray-700 text-white text-[0.5rem] rounded-sm shadow-md z-30 opacity-90 pointer-events-none" title="Please select a sound from the bank to add.">
            Select Sound
          </div>
        )}

        <div className="absolute bottom-1 right-1 flex space-x-0.5 pointer-events-none">
          {hasSoundData && <Tooltip content="Sounds Programmed" wrapperElementType="span" delay={300}><div className="w-1.5 h-1.5 bg-brand-seq rounded-full opacity-80"></div></Tooltip>}
          {hasMeaningfulJointData && <Tooltip content="Pose Data Programmed" wrapperElementType="span" delay={300}><div className="w-1.5 h-1.5 bg-brand-pos rounded-full opacity-80"></div></Tooltip>}
          {hasGroundingData && <Tooltip content="Grounding Defined" wrapperElementType="span" delay={300}><div className="w-1.5 h-1.5 bg-green-500 rounded-full opacity-80"></div></Tooltip>}
        </div>
      </div>
    </div>
  );
});

BeatButton.propTypes = {
  beatData: PropTypes.object,
  beatIndex: PropTypes.number.isRequired,
  appMode: PropTypes.string.isRequired,
  isSelectedForEdit: PropTypes.bool,
  isCurrentlySelectedInSeqMode: PropTypes.bool,
  isCurrentlyPlayingAtBeat: PropTypes.bool,
  isPlayheadPositionWhenPaused: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onAddSound: PropTypes.func,
  onDeleteSound: PropTypes.func,
  currentSoundInBank: PropTypes.string,
  logToConsole: PropTypes.func,
};

export default BeatButton;