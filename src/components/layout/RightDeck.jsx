// src/components/layout/RightDeck.jsx

import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import OptionButtons from '../ui/OptionButtons';
import './Deck.css';

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
                <OptionButtons />
                {/* For pads, the 'side' prop determines which set of 8 pads to show */}
                <Pads side="right" />
            </div>
        </div>
    );
};

export default RightDeck;