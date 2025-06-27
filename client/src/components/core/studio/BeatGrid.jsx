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
    const { 
        currentEditingBar, 
        activeBeatIndex, 
        viewMode, 
        currentSoundInBank, 
        handleBeatClick 
    } = useUIState();

    const { 
        songData, 
        updateSongData, 
        clearPose 
    } = useSequence();

    const { 
        isPlaying, 
        currentStep, 
        currentBar 
    } = usePlayback();

    // 2. Safely derive the data to be rendered
    const currentBarBeats = songData[currentEditingBar]?.beats || [];

    // 3. Define handlers that will update the state via the context
    // These handlers wrap the `updateSongData` function from the SequenceContext.
    const handleAddSound = useCallback((barIdx, beatIdx, soundName) => {
        updateSongData(d => {
            const beat = d[barIdx].beats[beatIdx];
            const sounds = beat.sounds || [];
            if (!sounds.includes(soundName) && sounds.length < MAX_SOUNDS_PER_BEAT) {
                beat.sounds = [...sounds, soundName];
            }
            return d;
        }, 'Add Sound');
    }, [updateSongData]);

    const handleDeleteSound = useCallback((barIdx, beatIdx, soundName) => {
        updateSongData(d => {
            const beat = d[barIdx].beats[beatIdx];
            if (beat.sounds) {
                beat.sounds = beat.sounds.filter(s => s !== soundName);
            }
            return d;
        }, 'Delete Sound');
    }, [updateSongData]);


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
                            onClearPoseData={clearPose}
                            currentSoundInBank={currentSoundInBank}
                            onAddSound={handleAddSound}
                            onDeleteSound={handleDeleteSound}
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
                                onClearPoseData={clearPose}
                                currentSoundInBank={currentSoundInBank}
                                onAddSound={handleAddSound}
                                onDeleteSound={handleDeleteSound}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default BeatGrid;