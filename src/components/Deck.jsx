import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import './Deck.css';

const Deck = ({ side }) => {
    // Correctly call hooks at the top level of the component
    const { selectedBeat, setSelectedBeat, selectedBar } = useUIState();
    const { getCurrentBarData } = useSequence();

    // Get the data for the currently selected bar
    const barData = getCurrentBarData(selectedBar);
    
    // Determine which slice of the bar data this deck is responsible for
    // Slicing an empty array is safe and will just return an empty array
    const padData = side === 'left' ? barData.slice(0, 8) : barData.slice(8, 16);
    const padOffset = side === 'left' ? 0 : 8;

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

            {/* Bottom row containing the performance pads */}
            <div className="deck-pads-section">
                <div className="option-buttons">
                    <div className="placeholder-option-btn">Opt 1</div>
                    <div className="placeholder-option-btn">Opt 2</div>
                    <div className="placeholder-option-btn">Opt 3</div>
                    <div className="placeholder-option-btn">Opt 4</div>
                </div>
                <div className="pads-grid">
                    {/* Map over the 8 pads for this deck */}
                    {Array.from({ length: 8 }).map((_, index) => {
                        const beatIndexInBar = padOffset + index;
                        const beatDataForPad = padData[index]; // Use the sliced data
                        return (
                            <PerformancePad 
                                key={`pad-${side}-${index}`}
                                beatData={beatDataForPad}
                                beatNum={beatIndexInBar + 1}
                                isSelected={selectedBeat === beatIndexInBar}
                                onClick={() => {
                                    console.log(`[Deck] Performance Pad ${beatIndexInBar + 1} clicked.`);
                                    setSelectedBeat(beatIndexInBar);
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Deck;