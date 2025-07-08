// src/components/layout/RightDeck.jsx
import React from 'react';
import RotaryController from '../ui/RotaryController/RotaryController';
import DeckJointList from '../ui/DeckJointList';
import Pads from '../ui/Pads';
import './Deck.css';

const RightDeck = ({ onPadTrigger, onJointUpdate }) => {
    return (
        <aside className="deck-container" data-side="right">
            <div className="deck-top-row">
                <RotaryController deckId="deck1" onJointUpdate={onJointUpdate} />
                <DeckJointList side="right" />
            </div>
            <div className="pads-group">
                <Pads side="left" onPadClick={onPadTrigger} />
            </div>
        </aside>
    );
};
export default RightDeck;