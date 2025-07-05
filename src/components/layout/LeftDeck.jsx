import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import OptionButtons from '../ui/OptionButtons';
import Pads from '../ui/Pads';
import './Deck.css';

// The main column for a deck, containing the interactive elements.
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

const LeftDeck = () => {
    return (
        // The `data-side` attribute is used by Deck.css to control the order of children
        <div className="deck-container" data-side="left">
            <PitchSlider />
            <DeckMainColumn deckId="deck1" side="left" />
            <DeckJointList side="left" />
        </div>
    );
};

export default LeftDeck;