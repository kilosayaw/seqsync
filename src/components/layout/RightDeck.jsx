// src/components/layout/RightDeck.jsx
import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import RightOptionButtons from '../ui/RightOptionButtons';

const RightDeck = () => {
  return (
    <div className="deck-container" data-side="right">
      <div className="deck-top-row">
        <DeckJointList side="right" />
        <div className="turntable-group">
          <RotaryButtons />
          <RotaryController deckId="deck2" />
        </div>
        <PitchSlider />
      </div>
      <div className="pads-group">
        <div className="option-buttons-container">
          <RightOptionButtons />
        </div>
        <div className="pads-container">
          <Pads side="right" />
        </div>
      </div>
    </div>
  );
};

export default RightDeck;