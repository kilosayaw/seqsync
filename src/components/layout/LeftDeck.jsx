// src/components/layout/LeftDeck.jsx
import React from 'react';
import RotaryController from '../ui/RotaryController/RotaryController';
import DeckJointList from '../ui/DeckJointList';
import Pads from '../ui/Pads';
import './Deck.css';

const LeftDeck = ({ onPadTrigger, onJointUpdate }) => {
    return (
        <aside className="deck-container" data-side="left">
            <div className="deck-top-row">
                <DeckJointList side="left" />
                <RotaryController deckId="deck1" onJointUpdate={onJointUpdate} />
            </div>
            <div className="pads-group">
                <Pads side="left" onPadClick={onPadTrigger} />
            </div>
        </aside>
    );
};
export default LeftDeck;