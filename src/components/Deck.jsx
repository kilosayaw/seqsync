import React from 'react';
import DeckJointList from './DeckJointList';
import RotaryController from './RotaryController';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from '../hooks/usePadMapping';
import './Deck.css';

const Deck = ({ side }) => {
    const { selectedBeat, setSelectedBeat, noteDivision, setNoteDivision, selectedBar } = useUIState();
    const { isPlaying, currentBeat, seekToGlobalStep, auditionSlice } = usePlayback();
    const padMap = usePadMapping();

    const padData = side === 'left' ? padMap.slice(0, 8) : padMap.slice(8, 16);
    
    const cycleDivision = () => {
        const divisions = ['1/4', '1/8', '1/16', '1/2'];
        const currentIndex = divisions.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % divisions.length;
        setNoteDivision(divisions[nextIndex]);
    };

    return (
        <div className={`deck deck-${side}`}>
            {/* Top row containing the main interactive elements */}
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

            {/* Bottom row containing the pads and their controls */}
            <div className="deck-pads-section">
                <div className="option-buttons">
                    {/* Asymmetrical control logic */}
                    {side === 'left' ? (
                         <>
                            {/* The master note division controller */}
                            <button className="placeholder-option-btn active" onClick={cycleDivision}>
                                {noteDivision}
                            </button>
                            <div className="placeholder-option-btn disabled">Opt 2</div>
                            <div className="placeholder-option-btn disabled">Opt 3</div>
                            <div className="placeholder-option-btn disabled">Opt 4</div>
                         </>
                    ) : (
                         <>
                            {/* The right side has non-functional placeholders */}
                            <div className="placeholder-option-btn disabled" />
                            <div className="placeholder-option-btn disabled" />
                            <div className="placeholder-option-btn disabled" />
                            <div className="placeholder-option-btn disabled" />
                         </>
                    )}
                </div>
                <div className="pads-grid">
                    {padData.map((pad, index) => {
                        const displayNum = (side === 'left' ? index + 1 : index + 9);

                        if (pad.isEmpty) return <div key={`pad-empty-${side}-${index}`} className="performance-pad disabled"><span className="pad-number">{displayNum}</span></div>;
                        
                        let isActive = false;
                        if (isPlaying && selectedBar === pad.bar) {
                            let stepMultiplier = 1;
                            if (noteDivision === '1/8') stepMultiplier = 2;
                            else if (noteDivision === '1/4') stepMultiplier = 4;
                            else if (noteDivision === '1/2') stepMultiplier = 8;
                            
                            const padStartBeat = Math.floor(pad.beat / stepMultiplier) * stepMultiplier;
                            isActive = (currentBeat >= padStartBeat && currentBeat < padStartBeat + stepMultiplier);
                        }
                        
                        return (
                            <PerformancePad 
                                key={pad.key}
                                pad={{...pad, displayLabel: displayNum}}
                                isSelected={selectedBeat === pad.beat}
                                isActive={isActive}
                                onClick={() => {
                                    setSelectedBeat(pad.beat);
                                    seekToGlobalStep(pad.globalStep);
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