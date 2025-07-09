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
    const { selectedBar } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    
    return (
        <div className="deck-container" data-side="right">
            <MovementFader />
            
            <div className="deck-main-column">
                 <DirectionalControls />

                {/* DEFINITIVE FIX: This wrapper uses flexbox to center its child vertically */}
                <div className="deck-interactive-area-wrapper">
                    {/* This child is the square interactive area */}
                    <div className="deck-interactive-area">
                        <div className="turntable-group">
                            <div className="rotary-controller-container">
                                <RotaryController deckId="deck2" />
                            </div>
                            <div className="editor-overlays">
                                {/* XYZGrid or other controls are rendered here by RotaryController */}
                            </div>
                            <div className="edit-tool-placeholder top-left"></div>
                            <div className="edit-tool-placeholder top-right"></div>
                            <div className="edit-tool-placeholder bottom-left"></div>
                            <div className="edit-tool-placeholder bottom-right"></div>
                        </div>
                        
                        <div className="pads-group">
                            <div className="option-buttons-container">
                                <OptionButtons side="right" />
                            </div>
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
                </div>
            </div>
            
            <DeckJointList side="right" />
        </div>
    );
};

export default RightDeck;