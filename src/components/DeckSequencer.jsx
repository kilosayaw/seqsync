import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import ProBeatButton from './ProBeatButton';
import './DeckSequencer.css';

const DeckSequencer = () => {
  const { currentBeat } = usePlayback();
  const { selectedBeat, setSelectedBeat } = useUIState();

  const handleBeatSelect = (beatIndex) => {
    setSelectedBeat(beatIndex);
  };
  
  const sequencerButtons = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="deck-sequencer-container">
      {sequencerButtons.map(index => (
        <ProBeatButton
          key={index}
          beatIndex={index}
          isActive={currentBeat === index}
          isSelected={selectedBeat === index}
          onClick={handleBeatSelect}
        />
      ))}
    </div>
  );
};

export default DeckSequencer;