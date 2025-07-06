// src/components/layout/RightDeck.jsx

import React from 'react';

// UI Components
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import RightOptionButtons from '../ui/RightOptionButtons';

// Styles
import '../ui/Deck.css';

const RightDeck = () => {
  return (
    <div className="deck-container" data-side="right">
      {/* Column 1: Joint Selection List (Order is controlled by CSS) */}
      <DeckJointList side="right" />

      {/* Column 2: The Main Deck Core (Turntable + Pads) */}
      <div className="deck-main-column">
        <div className="turntable-group">
          <RotaryButtons />
          <RotaryController deckId="deck2" />
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

      {/* Column 3: Pitch Slider */}
      <PitchSlider />
    </div>
  );
};

export default RightDeck;