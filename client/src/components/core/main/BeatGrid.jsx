import React, { useCallback, useMemo } from 'react';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import BeatButton from '../sequencer/BeatButton';
import { UI_PADS_PER_BAR } from '../../../utils/constants';
import { useActionLogger } from '../../../hooks/useActionLogger';

const BeatGrid = () => {
    const { currentEditingBar, activeBeatIndex, viewMode, currentSoundInBank, handleBeatClick } = useUIState();
    const { songData, updateStateAndHistory } = useSequence();
    const { isPlaying, isRecording, currentStep, currentBar } = usePlayback();
    const log = useActionLogger('BeatGrid');

    const currentBarBeats = useMemo(() => {
        const beats = songData[currentEditingBar]?.beats || [];
        return Array.from({ length: UI_PADS_PER_BAR }, (_, i) => beats[i] || { id: `${currentEditingBar}-${i}`, sounds: [], jointInfo: {}, grounding: {} });
    }, [songData, currentEditingBar]);

    const handleAddSound = useCallback((barIdx, beatIdx) => {
        if (!currentSoundInBank) return;
        updateStateAndHistory(d => {
            const beat = d[barIdx].beats[beatIdx];
            if (!beat.sounds) beat.sounds = [];
            if (!beat.sounds.includes(currentSoundInBank) && beat.sounds.length < 4) {
                beat.sounds.push(currentSoundInBank);
            }
        }, `Add Sound: ${currentSoundInBank}`);
    }, [updateStateAndHistory, currentSoundInBank]);

    const handleDeleteSound = useCallback((barIdx, beatIdx, soundName) => {
        updateStateAndHistory(d => {
            if (d[barIdx]?.beats[beatIdx]?.sounds) {
                d[barIdx].beats[beatIdx].sounds = d[barIdx].beats[beatIdx].sounds.filter(s => s !== soundName);
            }
        }, `Delete Sound: ${soundName}`);
    }, [updateStateAndHistory]);
    
    const handleClearPoseData = useCallback((barIdx, beatIdx) => {
        updateStateAndHistory(d => {
            const beat = d[barIdx].beats[beatIdx];
            if (beat) {
                beat.jointInfo = {};
                beat.grounding = { L: null, R: null, L_weight: 50 };
                beat.thumbnail = null;
            }
        }, 'Clear Pose Data');
    }, [updateStateAndHistory]);

    return (
        <section aria-label="Beat Sequencer Grid" className="w-full relative flex-shrink-0">
            {/* --- DEFINITIVE FIX: Reduced padding and gap to shrink buttons proportionally --- */}
            {/* You can adjust `p-1` and `gap-1` to fine-tune the size. */}
            <div className="w-full bg-gray-800/30 p-1 rounded-lg grid grid-cols-8 grid-rows-2 gap-1">
                {currentBarBeats.map((beat, index) => (
                    <BeatButton
                        key={`beat-btn-${index}`}
                        beatData={beat}
                        barIndex={currentEditingBar}
                        beatIndex={index}
                        isActive={activeBeatIndex === index}
                        isCurrentStep={isPlaying && currentBar === currentEditingBar && currentStep === index}
                        isRecording={isRecording}
                        viewMode={viewMode}
                        onClick={handleBeatClick}
                        onAddSound={() => handleAddSound(currentEditingBar, index)}
                        onDeleteSound={handleDeleteSound}
                        onClearPoseData={handleClearPoseData}
                        currentSoundInBank={currentSoundInBank}
                    />
                ))}
            </div>
        </section>
    );
};

export default BeatGrid;