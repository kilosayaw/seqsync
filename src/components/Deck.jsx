import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from '../hooks/usePadMapping';
import './Deck.css';

const Deck = ({ side }) => {
    const { selectedBeat, setSelectedBeat, noteDivision, setNoteDivision, padPlayMode, setPadPlayMode } = useUIState();
    const { isPlaying } = usePlayback();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();

    const padOffset = side === 'left' ? 0 : 8;

    const cycleOptions = [ { division: 16, label: '1/16' }, { division: 8, label: '1/8' }, { division: 4, label: '1/4' } ];
    const currentCycleLabel = cycleOptions.find(opt => opt.division === noteDivision)?.label || '1/16';

    const handleCycle = () => {
        const currentIndex = cycleOptions.findIndex(opt => opt.division === noteDivision);
        const nextIndex = (currentIndex + 1) % cycleOptions.length;
        const newDivision = cycleOptions[nextIndex];
        console.log(`[Control] Cycle changed to ${newDivision.label}`);
        setNoteDivision(newDivision.division);
    };
    
    const handlePlayModeToggle = () => {
        const newMode = padPlayMode === 'TRIGGER' ? 'GATE' : 'TRIGGER';
        console.log(`[Control] Play Mode changed to ${newMode}`);
        setPadPlayMode(newMode);
    };

    return (
        <div className={`deck deck-${side}`}>
            {/* === RESTORED VISUAL STRUCTURE === */}
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
            {/* === END RESTORED STRUCTURE === */}

            <div className="deck-pads-section">
                <div className="option-buttons">
                    {side === 'left' ? (
                        <>
                            <div className="control-wrapper">
                                <div className="control-label">CYCLE</div>
                                <button className="control-button" onClick={handleCycle}>
                                    {currentCycleLabel}
                                </button>
                            </div>
                            <div className="control-wrapper">
                                <div className="control-label">PLAY MODE</div>
                                <button className="control-button" onClick={handlePlayModeToggle}>
                                    {padPlayMode}
                                </button>
                            </div>
                            <div className="placeholder-option-btn">Opt 3</div>
                            <div className="placeholder-option-btn">Opt 4</div>
                        </>
                    ) : (
                        <>
                            <div className="placeholder-option-btn">Opt 1</div>
                            <div className="placeholder-option-btn">Opt 2</div>
                            <div className="placeholder-option-btn">Opt 3</div>
                            <div className="placeholder-option-btn">Opt 4</div>
                        </>
                    )}
                </div>

                <div className="pads-grid">
                    {Array.from({ length: 8 }).map((_, index) => {
                        const padIndex = padOffset + index;
                        return (
                            <PerformancePad 
                                key={`pad-${side}-${padIndex}`}
                                beatNum={padIndex + 1}
                                isSelected={selectedBeat === padIndex}
                                isActive={isPlaying && activePadIndex === padIndex}
                                onMouseDown={() => {
                                    setSelectedBeat(padIndex);
                                    handlePadDown(padIndex);
                                }}
                                onMouseUp={() => {
                                    handlePadUp();
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