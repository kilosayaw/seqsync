// src/components/studio/sequencer/BeatGrid.jsx
import React from 'react';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import BeatButton from './BeatButton';
import TransitionIndicator from './TransitionIndicator';

const BeatGrid = () => {
    const { songData, addSoundToBeat, removeSoundFromBeat, clearPoseData } = useSequence();
    const { currentEditingBar, activeBeatIndex, setActiveBeatIndex, viewMode } = useUIState();

    const currentBarBeats = songData[currentEditingBar]?.beats || [];

    return (
        <div className="w-full bg-gray-800/30 p-3 rounded-lg">
            <div className="relative grid grid-cols-8 gap-x-2 gap-y-4">
                {currentBarBeats.map((beat, beatIdx) => (
                    <div key={`beat-container-${beatIdx}`} className="relative">
                        <BeatButton
                            barIndex={currentEditingBar}
                            beatIndex={beatIdx}
                            isActive={activeBeatIndex === beatIdx}
                            isCurrentStep={false} // This needs to come from PlaybackContext if needed
                            onClick={() => setActiveBeatIndex(beatIdx)}
                            // Pass all data and handlers from the beat object
                            sounds={beat.sounds}
                            viewMode={viewMode}
                            hasPoseData={beat.jointInfo && Object.keys(beat.jointInfo).length > 0}
                            poseData={beat.jointInfo}
                            grounding={beat.grounding}
                            thumbnail={beat.thumbnail}
                            transition={beat.transition} // Pass transition data
                            onDeleteSound={removeSoundFromBeat}
                            onClearPoseData={clearPoseData}
                        />
                        
                        {/* Render transition indicator for the space AFTER this beat */}
                        {beatIdx < currentBarBeats.length - 1 && (
                            <TransitionIndicator
                                beatIndex={beatIdx}
                                isVertical={beatIdx === 7} // Handle wrap from row 1 to 2
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BeatGrid;