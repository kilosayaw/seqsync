import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import './Deck.css';

const Deck = ({ side }) => {
    const pads = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
        <div className={`deck deck-${side}`}>
            {/* Top row containing the main interactive elements */}
            <div className="deck-interactive-row">
                {side === 'left' && (
                    <div className="side-panel-wrapper">
                        <div className="placeholder-v-slider">PITCH</div>
                    </div>
                )}
                {side === 'right' && <DeckJointList side="right" />}

                {/* This central column now contains top-controls and rotary */}
                <div className="deck-rotary-column">
                    <div className="deck-top-controls">
                        <div className="placeholder-pro-switch">Up/Down</div>
                        <div className="placeholder-pro-switch">L/R</div>
                        <div className="placeholder-pro-switch">Fwd/Back</div>
                    </div>
                    <div className="rotary-wrapper">
                        <div className="placeholder-side-button">Special</div>
                        <RotaryController side={side} />
                        <div className="placeholder-side-button">Special</div>
                    </div>
                </div>
                
                {side === 'left' && <DeckJointList side="left" />}
                {side === 'right' && (
                    <div className="side-panel-wrapper">
                        <div className="placeholder-v-slider">PITCH</div>
                    </div>
                )}
            </div>

            {/* Pads section is now a separate flex item at the bottom that will grow */}
            <div className="deck-pads-section">
                <div className="option-buttons">
                    <div className="placeholder-option-btn">Opt 1</div>
                    <div className="placeholder-option-btn">Opt 2</div>
                    <div className="placeholder-option-btn">Opt 3</div>
                    <div className="placeholder-option-btn">Opt 4</div>
                </div>
                <div className="pads-grid">
                    {pads.map(i => <div key={i} className="placeholder-pad">{i}</div>)}
                </div>
            </div>
        </div>
    );
};

export default Deck;