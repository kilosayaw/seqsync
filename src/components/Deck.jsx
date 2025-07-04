import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import PitchSlider from './PitchSlider';
import Pads from './Pads';
import './Deck.css';

const Deck = ({ side }) => {
    return (
        <div className={`deck deck-${side}`}>
            {/* The main row uses flexbox to arrange the vertical columns */}
            <div className="deck-main-row">
                
                {/* --- MIRRORED LAYOUT LOGIC --- */}
                
                {/* On the LEFT deck, the Pitch Slider is on the far left */}
                {side === 'left' && <PitchSlider side="left" />}
                
                {/* On the LEFT deck, the Joint List is on the inside */}
                {side === 'left' && <DeckJointList side="left" />}

                {/* The center column contains the rotary wheel and the pads */}
                <div className="deck-center-column">
                    <RotaryController side={side} />
                    <Pads side={side} />
                </div>

                {/* On the RIGHT deck, the Joint List is on the inside */}
                {side === 'right' && <DeckJointList side="right" />}

                {/* On the RIGHT deck, the Pitch Slider is on the far right */}
                {side === 'right' && <PitchSlider side="right" />}
                
            </div>
        </div>
    );
};

export default Deck;