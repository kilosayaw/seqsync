import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import DirectionalControls from '../ui/DirectionalControls';
import PresetPageSelectors from '../ui/PresetPageSelectors';
import CornerToolPanel from '../ui/CornerToolPanel';
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './Deck.css';

const LeftDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad, selectedJoints, setActiveCornerTool } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();

    const isJointSelected = selectedJoints.length > 0;

    const handleCornerToolClick = (toolName) => {
        if (toolName === 'BLANK') {
            setActiveCornerTool('none');
            return;
        }
        setActiveCornerTool(prev => prev === toolName ? 'none' : toolName);
    };
    
    return (
        <div className="deck-wrapper">
            <div className="deck-container" data-side="left">
                <DeckJointList side="left" />
                
                <div className="side-controls-column">
                    <MovementFader />
                    <OptionButtons side="left" />
                    <PresetPageSelectors side="left" />
                </div>
                
                <DirectionalControls />
                
                <div className={classNames('turntable-group', { 'is-editing': isJointSelected })}>
                    <div className="rotary-controller-container">
                        <RotaryController deckId="deck1" />
                    </div>
                    <button className="corner-tool-button top-left" onClick={() => handleCornerToolClick('ROT')}>ROT</button>
                    <button className="corner-tool-button top-right" onClick={() => handleCornerToolClick('NRG')}>NRG</button>
                    <button className="corner-tool-button bottom-left" onClick={() => handleCornerToolClick('INT')}>INT</button>
                    <button className="corner-tool-button bottom-right" onClick={() => handleCornerToolClick('BLANK')}></button>
                </div>

                <div className="pads-group">
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
                                side="left"
                            />
                        );
                    })}
                </div>
            </div>
            <CornerToolPanel side="left" />
        </div>
    );
};

export default LeftDeck;