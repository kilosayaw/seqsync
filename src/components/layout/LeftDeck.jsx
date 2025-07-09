// src/components/layout/LeftDeck.jsx
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

const LeftDeck = ({ onPadDown, onPadUp }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    return (
        // DEFINITIVE: The container now holds ALL deck elements.
        <div className="deck-container" data-side="left">
            <DeckJointList side="left" />
            <DirectionalControls />

            <div className="turntable-group">
                <div className="rotary-controller-container">
                    <RotaryController deckId="deck1" />
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
                <div className="option-buttons-container">
                    <OptionButtons side="left" />
                </div>
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

            <MovementFader />
        </div>
    );
};

export default LeftDeck;