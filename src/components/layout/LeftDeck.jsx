// src/components/layout/LeftDeck.jsx

import React from 'react';

// UI Components
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import LeftOptionButtons from '../ui/LeftOptionButtons';

// Styles
import '../ui/Deck.css';

const LeftDeck = () => {
  return (
    <div className="deck-container" data-side="left">
      {/* Column 1: Pitch Slider */}
      <PitchSlider />

      {/* Column 2: The Main Deck Core (Turntable + Pads) */}
      <div className="deck-main-column">
        <div className="turntable-group">
          <RotaryButtons />
          <RotaryController deckId="deck1" />
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

      {/* Column 3: Joint Selection List */}
      <DeckJointList side="left" />
    </div>
  );
};

export default LeftDeck;