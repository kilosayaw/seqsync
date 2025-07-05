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

            {/* DEFINITIVE FIX: The left deck uses the standard, simpler pads-group */}
            <div className="pads-group">
                <OptionButtons />
                <Pads side="left" />
            </div>
        </div>
    );
};

export default LeftDeck;