import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import ProBeatButton from './ProBeatButton';
import './MasterSequencer.css';

const MasterSequencer = () => {
    const { currentBeat, isPlaying } = usePlayback();
    // KEY FIX: Add `selectedBar` to the destructuring from the useUIState hook call.
    const { selectedBeat, setSelectedBeat, setIsPoseEditorOpen, setBeatToEdit, selectedBar } = useUIState();
    const { getCurrentBarData } = useSequence();

    const currentBarBeats = getCurrentBarData(selectedBar);

    const handleBeatSelect = (beatIndexInBar) => {
        setSelectedBeat(beatIndexInBar);
    };

    const handleBeatDoubleClick = (beatData, index) => {
        if (beatData && beatData.poseData) {
            // We need to pass the global index to the editor
            const beatWithGlobalIndex = {
                ...beatData,
                globalIndex: ((selectedBar - 1) * 16) + index
            };
            setBeatToEdit(beatWithGlobalIndex);
            setIsPoseEditorOpen(true);
        }
    };

    return (
        <div className="master-sequencer-wrapper">
            <div className="master-sequencer-container">
                {currentBarBeats.length > 0 ? (
                    currentBarBeats.map((beatData, index) => (
                        <ProBeatButton
                            key={`bar${beatData.bar}-beat${beatData.beat}`}
                            beatIndex={index}
                            beatData={beatData}
                            isActive={currentBeat === index && isPlaying}
                            isSelected={selectedBeat === index}
                            onClick={() => handleBeatSelect(index)}
                            onDoubleClick={() => handleBeatDoubleClick(beatData, index)}
                        />
                    ))
                ) : (
                    <div className="sequencer-placeholder">Load a track to begin sequencing.</div>
                )}
            </div>
        </div>
    );
};
// The invalid hook call that was previously here has been REMOVED.

export default MasterSequencer;