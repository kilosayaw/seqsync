import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import ProBeatButton from './ProBeatButton';
import './MasterSequencer.css';

const MasterSequencer = () => {
    const { currentBeat } = usePlayback();
    const { selectedBeat, setSelectedBeat } = useUIState();

    const handleBeatSelect = (beatIndex) => {
        setSelectedBeat(beatIndex);
    };

    const sequencerButtons = Array.from({ length: 16 }, (_, i) => i);

    return (
        // The outer wrapper is now gone, as the background can be handled by the parent
        <div className="master-sequencer-container">
            {sequencerButtons.map(index => (
                <ProBeatButton
                    key={index}
                    beatIndex={index}
                    isActive={currentBeat === index}
                    isSelected={selectedBeat === index}
                    onClick={() => handleBeatSelect(index)}
                    // We will pass waveform data here later
                />
            ))}
        </div>
    );
};

export default MasterSequencer;