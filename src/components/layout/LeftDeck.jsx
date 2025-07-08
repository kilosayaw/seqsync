// src/components/layout/LeftDeck.jsx

import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import { useUIState } from '../../context/UIStateContext'; // DEFINITIVE FIX: Re-added necessary imports
import { usePlayback } from '../../context/PlaybackContext';
import './Deck.css';

const LeftDeck = ({ onPadDown, onPadUp }) => {
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
                        const globalPadIndex = i;
                        const displayNumber = i + 1;
                        const isPulsing = isPlaying && selectedBar === currentBar && globalPadIndex === currentBeat;
                        
                        return (
                            <PerformancePad
                                key={`left-${i}`}
                                padIndex={globalPadIndex}
                                beatNum={displayNumber}
                                isPulsing={isPulsing}
                                onMouseDown={() => onPadDown(globalPadIndex)}
                                onMouseUp={() => onPadUp(globalPadIndex)}
                                onMouseLeave={() => onPadUp(globalPadIndex)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeftDeck;