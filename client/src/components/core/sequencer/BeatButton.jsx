// src/components/core/sequencer/BeatButton.jsx
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { MODES, MAX_SOUNDS_PER_BEAT, DEFAULT_NUM_BEATS_PER_BAR_CONST } from '../../../utils/constants';

const BeatButton = memo(({
  beatIndex,      // 0-indexed
  barIndex,       // 0-indexed
  isActive,       // Boolean: true if this beat is active (e.g., has sound in SEQ, or is selected in POS)
  isCurrentStep,  // Boolean: true if the playback cursor is currently on this beat
  onClick,        // Func: (barIndex, beatIndex) => void
  sounds = [],    // Array of sound names/keys programmed on this beat for SEQ mode display
  viewMode,       // String: current application mode ('SEQ' or 'POS')
  // beatSounds prop is redundant if `sounds` prop is used for the same purpose. Assuming `sounds` is the source.
}) => {
  const baseClasses = 'm-0.5 sm:m-1 rounded-lg flex flex-col items-center justify-center transition-all duration-100 ease-in-out border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 overflow-hidden relative aspect-square';
  // Size will be determined by the parent grid layout, aspect-square maintains it.
  // const sizeClasses = 'w-full h-full'; // Parent grid controls size

  let dynamicClasses = '';
  let ringColorClass = 'focus:ring-gray-400'; // Default focus ring

  if (viewMode === MODES.SEQ) {
    const hasSound = sounds && sounds.length > 0;
    if (isCurrentStep) {
      dynamicClasses = 'bg-yellow-500 border-yellow-300 animate-pulse scale-105';
      ringColorClass = 'focus:ring-yellow-200';
    } else if (hasSound) {
      dynamicClasses = 'bg-green-600 border-green-400 hover:bg-green-500';
      ringColorClass = 'focus:ring-green-300';
    } else {
      dynamicClasses = 'bg-gray-700 border-gray-500 hover:bg-gray-600';
    }
  } else if (viewMode === MODES.POS) {
    if (isCurrentStep && isActive) { // Playback on the active editing beat
        dynamicClasses = 'bg-yellow-500 border-purple-400 animate-pulse scale-105 shadow-lg';
        ringColorClass = 'focus:ring-yellow-200';
    } else if (isCurrentStep) { // Playback on a non-active-editing beat
      dynamicClasses = 'bg-yellow-400 border-yellow-200 animate-pulse';
      ringColorClass = 'focus:ring-yellow-100';
    } else if (isActive) { // This beat is selected for editing (activeBeatIndex)
      dynamicClasses = 'bg-purple-600 border-purple-400 scale-105 shadow-lg';
      ringColorClass = 'focus:ring-purple-300';
    } else {
      dynamicClasses = 'bg-gray-700 border-gray-500 hover:bg-gray-600';
    }
  }

  // Function to get a shortened display name for sounds
  const getDisplayName = (name) => {
    if (typeof name !== 'string') return 'ERR';
    const cleaned = name.replace(/\.(wav|mp3|ogg|aac)$/i, ''); // Remove common extensions
    return cleaned.length > 6 ? cleaned.substring(0, 5) + "…" : cleaned;
  };
  
  // Display beat number (1-indexed)
  const displayBeatNumber = beatIndex + 1;

  return (
    <button
      type="button"
      className={`${baseClasses} ${dynamicClasses} ${ringColorClass}`}
      onClick={() => onClick(barIndex, beatIndex)}
      aria-label={`Bar ${barIndex + 1}, Beat ${displayBeatNumber}. ${isActive ? 'Active.' : ''} ${isCurrentStep ? 'Playing.' : ''}`}
      title={`Bar: ${barIndex + 1}, Step: ${displayBeatNumber}`}
    >
      <span className="absolute top-1 left-1 text-[0.6rem] sm:text-xs text-gray-300/70 font-mono select-none">
        {displayBeatNumber}
      </span>
      {viewMode === MODES.SEQ && sounds && sounds.length > 0 && (
        <div className="text-white text-[8px] sm:text-[9px] leading-tight text-center mt-2 sm:mt-3 px-0.5 select-none flex flex-col items-center justify-center w-full">
          {sounds.slice(0, MAX_SOUNDS_PER_BEAT).map((soundName, index) => (
            <div 
              key={`${soundName}-${index}`} 
              className="truncate w-full max-w-[90%]" // Ensure text doesn't overflow badly
              title={soundName} // Full name on hover
            >
              {getDisplayName(soundName)}
            </div>
          ))}
          {sounds.length > MAX_SOUNDS_PER_BEAT && (
            <div className="mt-0.5 text-xxs">+{sounds.length - MAX_SOUNDS_PER_BEAT} more</div>
          )}
        </div>
      )}
      {/* Optionally, add a visual indicator for POS mode if the beat has pose data */}
      {viewMode === MODES.POS && isActive && (
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-purple-300 rounded-full opacity-70" title="Selected for Pose Edit"></div>
      )}
       {viewMode === MODES.POS && !isActive && sounds /* Check if beat has any pose data, even if not active */ && Object.keys(sounds).length > 0 && (
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50" title="Has Pose Data"></div>
      )}
    </button>
  );
});

BeatButton.propTypes = {
  beatIndex: PropTypes.number.isRequired,
  barIndex: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  sounds: PropTypes.arrayOf(PropTypes.string), // Expects an array of sound names/keys
  viewMode: PropTypes.string.isRequired,
  // beatSounds prop removed, assuming `sounds` is used for this.
};

export default BeatButton;