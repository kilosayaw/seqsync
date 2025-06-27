import React, { useCallback } from 'react';

// Context Hooks for state consumption
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { usePlayback } from '../../../contexts/PlaybackContext';

// Child Component
import BeatButton from '../sequencer/BeatButton';

// Constants
import { MAX_SOUNDS_PER_BEAT } from '../../../utils/constants';

const BeatGrid = () => {
  // 1. Consume state from our contexts
  const { currentEditingBar, activeBeatIndex, viewMode, currentSoundInBank, handleBeatClick } = useUIState();
  const { songData, updateSongData, clearPose } = useSequence();
  const { isPlaying, currentStep, currentBar } = usePlayback();

  // 2. Safely derive the data to be rendered
  const currentBarBeats = songData[currentEditingBar]?.beats || [];

  // 3. Define handlers that will update the state via the context
  const handleAddSound = useCallback((barIdx, beatIdx, soundName) => {
    if (!soundName) return; // Don't add if no sound is selected
    updateSongData(d => {
      const beat = d[barIdx].beats[beatIdx];
      const sounds = beat.sounds || [];
      if (!sounds.includes(soundName) && sounds.length < MAX_SOUNDS_PER_BEAT) {
        beat.sounds = [...sounds, soundName];
      }
      return d;
    }, 'Add Sound');
  }, [updateSongData]);

  const handleDeleteLastSound = useCallback((barIdx, beatIdx) => {
    updateSongData(d => {
      const beat = d[barIdx].beats[beatIdx];
      if (beat.sounds && beat.sounds.length > 0) {
        beat.sounds.pop(); // Remove the last sound
      }
      return d;
    }, 'Delete Last Sound');
  }, [updateSongData]);

  const handleClearPose = useCallback((barIdx, beatIdx) => {
      clearPose(barIdx, beatIdx);
  }, [clearPose]);

  // 4. Render the component JSX
  return (
    <section aria-label="Beat Sequencer Grid" className="w-full">
      <div className="w-full bg-gray-800/30 p-2 rounded-lg flex flex-col items-center justify-center">
        {/* First Row of 8 Beat Buttons */}
        <div className="grid grid-cols-8 gap-1.5 mb-1.5 w-full">
          {currentBarBeats.slice(0, 8).map((beat, beatIdx) => (
            <BeatButton
              key={`beat-A-${beatIdx}`}
              barIndex={currentEditingBar}
              beatIndex={beatIdx}
              isActive={activeBeatIndex === beatIdx}
              isCurrentStep={isPlaying && currentBar === currentEditingBar && currentStep === beatIdx}
              onClick={handleBeatClick}
              sounds={beat?.sounds}
              viewMode={viewMode}
              hasPoseData={!!beat?.jointInfo && Object.keys(beat.jointInfo).length > 0}
              thumbnail={beat?.thumbnail}
              onClearPoseData={handleClearPose}
              currentSoundInBank={currentSoundInBank}
              onAddSound={handleAddSound}
              onDeleteLastSound={handleDeleteLastSound}
            />
          ))}
        </div>
        {/* Second Row of 8 Beat Buttons */}
        <div className="grid grid-cols-8 gap-1.5 w-full">
          {currentBarBeats.slice(8, 16).map((beat, beatIdx) => {
            const actualBeatIndex = beatIdx + 8; // Offset for the second row
            return (
              <BeatButton
                key={`beat-B-${actualBeatIndex}`}
                barIndex={currentEditingBar}
                beatIndex={actualBeatIndex}
                isActive={activeBeatIndex === actualBeatIndex}
                isCurrentStep={isPlaying && currentBar === currentEditingBar && currentStep === actualBeatIndex}
                onClick={handleBeatClick}
                sounds={beat?.sounds}
                viewMode={viewMode}
                hasPoseData={!!beat?.jointInfo && Object.keys(beat.jointInfo).length > 0}
                thumbnail={beat?.thumbnail}
                onClearPoseData={handleClearPose}
                currentSoundInBank={currentSoundInBank}
                onAddSound={handleAddSound}
                onDeleteLastSound={handleDeleteLastSound}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BeatGrid;