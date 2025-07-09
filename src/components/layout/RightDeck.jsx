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
// DEFINITIVE FIX: Import useSequence
import { useSequence } from '../../context/SequenceContext';
import './Deck.css';

const RightDeck = ({ onPadDown, onPadUp }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();
    
    return (
        <div className="deck-container" data-side="right">
            {/* DEFINITIVE: Mirrored Layout */}

            {/* Column 1: Fader and Options */}
            <div className="fader-options-group">
                <MovementFader />
                <div className="side-options-container">
                    <OptionButtons side="right" />
                </div>
            </div>

            {/* Column 2: Main Content */}
            <DirectionalControls />
            <div className="turntable-group">
                <div className="rotary-controller-container">
                    <RotaryController deckId="deck2" />
                </div>
                <div className="editor-overlays"></div>
                <div className="edit-tool-placeholder top-left"></div>
                <div className="edit-tool-placeholder top-right"></div>
                <div className="edit-tool-placeholder bottom-left"></div>
                <div className="edit-tool-placeholder bottom-right"></div>
            </div>
            
            <div className="pads-group">
                {Array.from({ length: 4 }).map((_, i) => {
                    const stepInBar = i + 4; 
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
                            onMouseDown={() => onPadDown(globalPadIndex)}
                            onMouseUp={() => onPadUp(globalPadIndex)}
                            onMouseLeave={() => onPadUp(globalPadIndex)}
                        />
                    );
                })}
            </div>
            
            {/* Column 3: Joint List */}
            <DeckJointList side="right" />
        </div>
    );
};

export default RightDeck;