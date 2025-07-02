import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from '../hooks/usePadMapping';
// FIX: The missing import statement is now included.
import { useJointControls } from '../hooks/useJointControls';
import './Deck.css';

const Deck = ({ side }) => {
    const { selectedBeat, setSelectedBeat, noteDivision, setNoteDivision, padPlayMode, setPadPlayMode } = useUIState();
    const { isPlaying } = usePlayback();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();
    
    // This now correctly uses the imported hook.
    const { incrementRotation } = useJointControls(side);

    const padOffset = side === 'left' ? 0 : 8;

    const cycleOptions = [ { division: 16, label: '1/16' }, { division: 8, label: '1/8' }, { division: 4, label: '1/4' } ];
    const currentCycleLabel = cycleOptions.find(opt => opt.division === noteDivision)?.label || '1/16';

    const handleCycle = () => {
        const currentIndex = cycleOptions.findIndex(opt => opt.division === noteDivision);
        const nextIndex = (currentIndex + 1) % cycleOptions.length;
        setNoteDivision(cycleOptions[nextIndex].division);
    };
    
    const handlePlayModeToggle = () => {
        setPadPlayMode(prev => prev === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    };

    return (
        <div className={`deck deck-${side}`}>
            <div className="deck-interactive-row">
                {side === 'left' && (
                    <div className="side-panel-wrapper">
                        <div className="placeholder-v-slider">PITCH</div>
                    </div>
                )}
                {side === 'right' && <DeckJointList side="right" />}

                <div className="deck-rotary-column">
                    <div className="deck-top-controls">
                        {/* Corrected placeholders to be buttons and wired them up */}
                        <button className="pro-switch" onClick={() => console.log('up/down')}>Up/Down</button>
                        <button className="pro-switch" onClick={() => console.log('l/r')}>L/R</button>
                        <button className="pro-switch" onClick={() => console.log('fwd/back')}>Fwd/Back</button>
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
                            <button className="placeholder-option-btn">Opt 3</button>
                            <button className="placeholder-option-btn">Opt 4</button>
                        </>
                    ) : (
                        <>
                            <button className="placeholder-option-btn">Opt 1</button>
                            <button className="placeholder-option-btn">Opt 2</button>
                            <button className="placeholder-option-btn">Opt 3</button>
                            <button className="placeholder-option-btn">Opt 4</button>
                        </>
                    )}
                </div>

                <div className="pads-grid">
                    {Array.from({ length: 8 }).map((_, index) => {
                        const padIndex = padOffset + index;
                        const isPadSelected = selectedBeat === padIndex;
                        const isPadActive = isPlaying && activePadIndex === padIndex;
                        return (
                            <PerformancePad 
                                key={`pad-${side}-${padIndex}`}
                                beatNum={padIndex + 1}
                                isSelected={isPadSelected}
                                isActive={isPadActive}
                                onMouseDown={() => {
                                    setSelectedBeat(padIndex);
                                    handlePadDown(padIndex);
                                }}
                                onMouseUp={handlePadUp}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Deck;