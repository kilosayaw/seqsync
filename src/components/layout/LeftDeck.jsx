// src/components/layout/LeftDeck.jsx
import React from 'react';
import RotaryController from '../ui/RotaryController/RotaryController';
import DeckJointList from '../ui/DeckJointList';
import MovementFader from '../ui/MovementFader';
import Pads from '../ui/Pads';
import './Deck.css';

const LeftDeck = ({ onPadTrigger }) => { // It receives the handler here...
    return (
        <aside className="deck-container" data-side="left">
            <div className="deck-top-row">
                <MovementFader />
                <RotaryController deckId="deck1" />
                <DeckJointList side="left" />
            </div>
            <div className="pads-group">
                {/* ...and passes it down here */}
                <Pads side="left" onPadClick={onPadTrigger} /> 
            </div>
        </aside>
    );
};
export default LeftDeck;