// src/components/Deck.jsx
import React from 'react';
import DeckJointList from './DeckJointList';
import PitchSlider from './PitchSlider';
import RotaryController from './RotaryController';
import RotaryButtons from './RotaryButtons';
import OptionButtons from './OptionButtons';
import Pads from './Pads';
import './Deck.css';

// This new component encapsulates the center column of the deck
const DeckMainColumn = ({ deckId, side }) => (
    <div className="deck-main-column">
        {/* Group 1: Turntable Controls */}
        <div className="turntable-group">
            <RotaryButtons />
            <RotaryController deckId={deckId} />
        </div>
        {/* Group 2: Pad Controls */}
        <div className="pads-group">
            <OptionButtons />
            <Pads side={side} />
        </div>
    </div>
);

const Deck = ({ deckId, side }) => {
    return (
        // data-side is used by CSS to reorder the children
        <div className="deck" data-side={side}>
            <PitchSlider />
            <DeckMainColumn deckId={deckId} side={side} />
            <DeckJointList side={side} />
        </div>
    );
};

export default Deck;