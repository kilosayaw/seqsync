// src/components/layout/RightDeck.jsx
import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import DirectionalControls from '../ui/DirectionalControls';
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import './Deck.css';

const RightDeck = ({ onPadDown, onPadUp }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    return (
        <div className="deck-wrapper">
            <DirectionalControls />
            <div className="deck-container" data-side="right">
                <DeckJointList side="right" />
                <div className="deck-main-column">
                    <div className="turntable-group">
                        <RotaryController deckId="deck2" />
                    </div>
                    <div className="pads-group">
                        <OptionButtons side="right" />
                        {/* Pads are now direct children of the grid */}
                        {Array.from({ length: 8 }).map((_, i) => {
                            const globalPadIndex = i + 8;
                            const displayNumber = i + 9;
                            const isPulsing = isPlaying && selectedBar === currentBar && globalPadIndex === currentBeat;
                            return (
                                <PerformancePad
                                    key={`right-${i}`}
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
                <MovementFader />
            </div>
        </div>
    );
};
export default RightDeck;