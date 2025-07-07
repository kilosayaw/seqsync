// src/components/layout/LeftDeck.jsx

import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import './Deck.css';

// This component now only needs the master trigger function passed as a prop.
const LeftDeck = ({ onPadTrigger }) => {
    // It still needs to know the current state to properly display the pulsing highlight.
    const { selectedBar } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    return (
        <div className="deck-container" data-side="left">
            <div className="deck-top-row">
                <MovementFader />
                <div className="turntable-group">
                    <RotaryButtons />
                    <RotaryController deckId="deck1" />
                </div>
                <DeckJointList side="left" />
            </div>
            <div className="pads-group">
                <OptionButtons side="left" />
                <div className="pads-container">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const globalPadIndex = i; // Left deck pads are 0-7
                        const displayNumber = i + 1;
                        const isPulsing = isPlaying && selectedBar === currentBar && globalPadIndex === currentBeat;
                        
                        return (
                            <PerformancePad
                                key={`left-${i}`}
                                padIndex={globalPadIndex}
                                beatNum={displayNumber}
                                isPulsing={isPulsing}
                                // The pad now calls the master handler from ProLayout directly.
                                onMouseDown={() => onPadTrigger(globalPadIndex)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeftDeck;