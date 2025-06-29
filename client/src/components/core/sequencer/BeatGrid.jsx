// src/components/studio/sequencer/BeatGrid.jsx
import React, { useCallback } from 'react';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import BeatButton from './BeatButton';
import TransitionIndicator from './TransitionIndicator';

const BeatGrid = () => {
    const { songData, addSoundToBeat, removeSoundFromBeat, clearPoseData } = useSequence();
    const { 
        currentEditingBar, 
        activeBeatIndex, 
        setActiveBeatIndex, 
        viewMode,
        currentSoundInBank // <-- Get selected sound from context
    } = useUIState();

    const currentBarBeats = songData[currentEditingBar]?.beats || [];

    const handleBeatClick = useCallback((barIndex, beatIndex) => {
        setActiveBeatIndex(beatIndex);
        // [LOGIC RESTORED] If in SEQ mode and a sound is selected, add it to the beat.
        if (viewMode === 'SEQ' && currentSoundInBank) {
            const currentBeatSounds = songData[barIndex]?.beats[beatIndex]?.sounds || [];
            if (!currentBeatSounds.includes(currentSoundInBank)) {
                addSoundToBeat(barIndex, beatIndex, currentSoundInBank);
            }
        }
    }, [viewMode, currentSoundInBank, setActiveBeatIndex, addSoundToBeat, songData]);

    return (
        <div className="w-full bg-gray-800/30 p-3 rounded-lg">
            <div className="relative grid grid-cols-8 gap-x-2 gap-y-4">
                {currentBarBeats.map((beat, beatIdx) => (
                    <div key={`beat-container-${beatIdx}`} className="relative">
                        <BeatButton
                            barIndex={currentEditingBar}
                            beatIndex={beatIdx}
                            isActive={activeBeatIndex === beatIdx}
                            onClick={handleBeatClick} // <-- Use the new enhanced handler
                            beatData={beat}
                            viewMode={viewMode}
                            onDeleteSound={removeSoundFromBeat}
                            onClearPoseData={clearPoseData}
                        />
                        
                        {/* Render transition indicator for the space AFTER this beat */}
                        {beatIdx < currentBarBeats.length - 1 && (
                            <TransitionIndicator
                                beatIndex={beatIdx}
                                isVertical={beatIdx === 7} 
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BeatGrid;