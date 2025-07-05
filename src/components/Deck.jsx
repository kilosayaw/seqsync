import React from 'react';
import RotaryController from './RotaryController';
import Pads from './Pads';
import RotaryButtons from './RotaryButtons';
import OptionButtons from './OptionButtons';
import './Deck.css';

const Deck = ({ deckId, side }) => {
    return (
        <div className="deck-main-column">
            <RotaryButtons />
            <RotaryController deckId={deckId} />
            <OptionButtons />
            <Pads side={side} />
        </div>
    );
};

export default Deck;