import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import OptionButtons from '../ui/OptionButtons';
import './Deck.css';

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

            {/* This now matches the structure of the RightDeck's pad area */ }
            <div className="pads-group">
                <OptionButtons />
                <div className="pads-container">
                    <Pads side="left" />
                </div>
            </div>
        </div>
    );
};

export default LeftDeck;