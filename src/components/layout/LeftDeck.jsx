// src/components/layout/LeftDeck.jsx
import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import LeftOptionButtons from '../ui/LeftOptionButtons';

const LeftDeck = () => {
  return (
    <div className="deck-container" data-side="left">
      <div className="deck-top-row">
        <PitchSlider />
        <div className="turntable-group">
          <RotaryButtons />
          <RotaryController deckId="deck1" />
        </div>
        <DeckJointList side="left" />
      </div>
      <div className="pads-group">
        <div className="option-buttons-container">
          <LeftOptionButtons />
        </div>
        <div className="pads-container">
          <Pads side="left" />
        </div>
      </div>
    </div>
  );
};

export default LeftDeck;