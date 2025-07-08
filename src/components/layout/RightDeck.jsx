// src/components/layout/RightDeck.jsx
import React from 'react';
import RotaryController from '../ui/RotaryController/RotaryController';
import DeckJointList from '../ui/DeckJointList';
import MovementFader from '../ui/MovementFader';
import Pads from '../ui/Pads';
import './Deck.css';

const RightDeck = ({ onPadTrigger }) => { // It receives the handler here...
    return (
        <aside className="deck-container" data-side="right">
            <div className="deck-top-row">
                <DeckJointList side="right" />
                <RotaryController deckId="deck2" />
                <MovementFader />
            </div>
            <div className="pads-group">
                {/* ...and passes it down here */}
                <Pads side="right" onPadClick={onPadTrigger} />
            </div>
        </aside>
    );
};
export default RightDeck;