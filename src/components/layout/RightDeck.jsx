import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import OptionButtons from '../ui/OptionButtons';
import Pads from '../ui/Pads';
import './Deck.css';

// This is a shared sub-component, its structure is correct.
const DeckMainColumn = ({ deckId, side }) => (
    <div className="deck-main-column">
        <div className="turntable-group">
            <RotaryButtons />
            <RotaryController deckId={deckId} />
        </div>
        <div className="pads-group">
            <OptionButtons />
            <Pads side={side} />
        </div>
    </div>
);

const RightDeck = () => {
    return (
        // The `data-side` attribute is used by Deck.css to control the order
        <div className="deck-container" data-side="right">
            {/* CORRECTED ORDER: The Joint List is now the first child */}
            <DeckJointList side="right" />
            <DeckMainColumn deckId="deck2" side="right" />
            <PitchSlider />
        </div>
    );
};

export default RightDeck;