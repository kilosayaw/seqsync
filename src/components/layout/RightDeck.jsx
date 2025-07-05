import React from 'react';
import PitchSlider from '../ui/PitchSlider';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import BpmModule from '../ui/BpmModule';
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

            <div className="pads-group right-pads-group">
                <div className="option-btn-slot"><BpmModule /></div>
                <div className="option-btn-slot" />
                <div className="option-btn-slot" />
                <div className="option-btn-slot" />
                <div className="pads-container-wrapper">
                    <Pads side="right" />
                </div>
            </div>
        </div>
    );
};

export default RightDeck;