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

const LeftDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();
    
    return (
        <div className="deck-container" data-side="left">
            <DeckJointList side="left" />
            <div className="side-controls-column">
                <MovementFader />
                <OptionButtons side="left" />
            </div>
            <DirectionalControls />
            <div className="turntable-group">
                <div className="rotary-controller-container">
                    <RotaryController deckId="deck1" />
                </div>
                <div className="editor-overlays"></div>
                <div className="edit-tool-placeholder top-left"></div>
                <div className="edit-tool-placeholder top-right"></div>
                <div className="edit-tool-placeholder bottom-left"></div>
                <div className="edit-tool-placeholder bottom-right"></div>
            </div>

            {/* DEFINITIVE REFACTOR: .pads-group now contains both pads and presets */ }
            <div className="pads-group">
                <div className="performance-pads-wrapper">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + i;
                        return (
                            <PerformancePad
                                key={`left-${i}`}
                                padIndex={globalPadIndex}
                                beatNum={i + 1}
                                isPulsing={isPlaying && selectedBar === currentBar && i === currentBeat}
                                isSelected={activePad === globalPadIndex}
                                onMouseDown={() => onPadEvent('down', globalPadIndex)}
                                onMouseUp={() => onPadEvent('up', globalPadIndex)}
                                onMouseLeave={() => onPadEvent('up', globalPadIndex)}
                            />
                        );
                    })}
                </div>
                <PresetPageSelectors side="left" />
            </div>
        </div>
    );
};

export default LeftDeck;