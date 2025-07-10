import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import DirectionalControls from '../ui/DirectionalControls';
import PresetPageSelectors from '../ui/PresetPageSelectors';
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSequence } from '../../context/SequenceContext';
import './Deck.css';

const RightDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();
    
    return (
        <div className="deck-container" data-side="right">
            <DeckJointList side="right" />
            <div className="side-controls-column">
                <MovementFader />
                <OptionButtons side="right" />
            </div>
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
            
            {/* DEFINITIVE REFACTOR: Re-introducing the wrapper for the grid layout */ }
            <div className="pads-group">
                <PresetPageSelectors side="right" />
                <div className="performance-pads-wrapper">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const stepInBar = i + 4;
                        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + stepInBar;
                        return (
                            <PerformancePad
                                key={`right-${i}`}
                                padIndex={globalPadIndex}
                                beatNum={i + 5}
                                isPulsing={isPlaying && selectedBar === currentBar && stepInBar === currentBeat}
                                isSelected={activePad === globalPadIndex}
                                onMouseDown={() => onPadEvent('down', globalPadIndex)}
                                onMouseUp={() => onPadEvent('up', globalPadIndex)}
                                onMouseLeave={() => onPadEvent('up', globalPadIndex)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RightDeck;