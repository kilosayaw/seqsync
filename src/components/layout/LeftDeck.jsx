import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import OptionButtons from '../ui/OptionButtons';
import Pads from '../ui/Pads';
import './Deck.css';

const LeftDeck = () => {
    return (
        // The container is now a vertical flex column
        <div className="deck-container" data-side="left">
            {/* The top row contains the turntable and its direct side controls */}
            <div className="deck-top-row">
                <PitchSlider />
                <div className="turntable-group">
                    <RotaryButtons />
                    <RotaryController deckId="deck1" />
                </div>
                <DeckJointList side="left" />
            </div>

            {/* The pads group is now a direct child, allowing it to span the full width */}
            <div className="pads-group">
                <OptionButtons side="left" /> {/* Pass prop */}
                <Pads side="left" />
            </div>
        </div>
    );
};

export default LeftDeck;