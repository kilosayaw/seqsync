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
import { useSequence } from '../../context/SequenceContext';
import './Deck.css';

// DEFINITIVE: Simplified props to a single event handler
const RightDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();
    
    return (
        <div className="deck-container" data-side="right">
            <div className="fader-options-group">
                <MovementFader />
                <div className="side-options-container">
                    <OptionButtons side="right" />
                </div>
            </div>
            
            <DirectionalControls />
            
            <div className="turntable-group">
                <div className="rotary-controller-container">
                    <RotaryController deckId="deck2" />
                </div>
                <div className="editor-overlays">
                    {/* XYZGrid is rendered inside RotaryController */}
                </div>
                <div className="edit-tool-placeholder top-left"></div>
                <div className="edit-tool-placeholder top-right"></div>
                <div className="edit-tool-placeholder bottom-left"></div>
                <div className="edit-tool-placeholder bottom-right"></div>
            </div>
            
            <div className="pads-group">
                {Array.from({ length: 4 }).map((_, i) => {
                    const stepInBar = i + 4; // Pads 5-8 of the bar
                    const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + stepInBar;
                    const displayNumber = i + 5;
                    const isPulsing = isPlaying && selectedBar === currentBar && stepInBar === currentBeat;

                    return (
                        <PerformancePad
                            key={`right-${i}`}
                            padIndex={globalPadIndex}
                            beatNum={displayNumber}
                            isPulsing={isPulsing}
                            isSelected={activePad === globalPadIndex}
                            // DEFINITIVE: Simplified event handlers
                            onMouseDown={() => onPadEvent('down', globalPadIndex)}
                            onMouseUp={() => onPadEvent('up', globalPadIndex)}
                            onMouseLeave={() => onPadEvent('up', globalPadIndex)}
                        />
                    );
                })}
            </div>
            
            <DeckJointList side="right" />
        </div>
    );
};

export default RightDeck;