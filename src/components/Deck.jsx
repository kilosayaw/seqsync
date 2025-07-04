import React from 'react';
import RotaryController from './RotaryController';
import Pads from './Pads';
import RotaryButtons from './RotaryButtons';
import OptionButtons from './OptionButtons';
import PitchSlider from './PitchSlider';
import DeckJointList from './DeckJointList';
import './Deck.css';

const Deck = ({ deckId }) => {
    const side = deckId === 'deck1' ? 'left' : 'right';
    return (
        <div className={`deck deck-${side}`}>
            <PitchSlider side={side} />
            <div className="deck-main-column">
                <RotaryController deckId={deckId} />
                <div className="deck-controls-area">
                    <RotaryButtons />
                    <OptionButtons />
                </div>
                <Pads side={side} />
            </div>
            <DeckJointList side={side} />
        </div>
    );
};

export default Deck;