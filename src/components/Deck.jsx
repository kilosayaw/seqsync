import React from 'react';
import DeckSequencer from './DeckSequencer';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import './Deck.css';

const Deck = ({ side }) => {
  const pads = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className={`deck deck-${side}`}>
      {/* --- Functional Sequencer --- */}
      <DeckSequencer side={side} /> 

      <div className="main-deck-area">
        {side === 'left' && (
          <div className="side-slider">
            <div className="placeholder-v-slider"></div>
          </div>
        )}
        
        {side === 'right' && <DeckJointList side="right" />}

        <div className="rotary-and-pads">
          <div className="deck-top-controls">
            <div className="placeholder-pro-switch">Up/Down</div>
            <div className="placeholder-pro-switch">L/R</div>
            <div className="placeholder-pro-switch">Fwd/Back</div>
          </div>
          <div className="rotary-wrapper">
            <div className="placeholder-side-button">Special</div>
            
            {/* --- Functional Rotary Controller --- */}
            <RotaryController side={side} />
            
            <div className="placeholder-side-button">Special</div>
          </div>
          <div className="deck-bottom-controls">
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

        {side === 'left' && <DeckJointList side="left" />}

        {side === 'right' && (
          <div className="side-slider">
            <div className="placeholder-v-slider"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deck;