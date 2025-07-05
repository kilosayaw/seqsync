// src/components/DeckAndPads.jsx
import React from 'react';
import Deck from './Deck';
import Pads from './Pads';
import './DeckAndPads.css';

const DeckAndPads = ({ deckId, side }) => {
    return (
        <div className="deck-and-pads-container">
            <Deck deckId={deckId} side={side} />
            <Pads side={side} />
        </div>
    );
};

export default DeckAndPads;