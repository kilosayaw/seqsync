import React from 'react';
import PropTypes from 'prop-types';
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

const RightDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad, selectedJoints, activeCornerTools, setActiveCornerTools } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR } = useSequence();

    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith('R'));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;
    
    const handleCornerToolClick = (toolName) => {
        if (toolName === 'BLANK') {
            setActiveCornerTools(prev => ({ ...prev, right: 'none' }));
            return;
        }
        setActiveCornerTools(prev => ({
            ...prev,
            right: prev.right === toolName ? 'none' : toolName
        }));
    };

    return (
        <div className="deck-wrapper">
            <div className="deck-container" data-side="right">
                <DeckJointList side="right" />
                <div className="side-controls-column">
                    {/* The only change is adding the side prop here */}
                    <MovementFader side="right" />
                    <OptionButtons side="right" />
                    <PresetPageSelectors side="right" />
                </div>
                
                <DirectionalControls />

                <div className={classNames('turntable-group', { 'is-editing': isEditing })}>
                    <div className="rotary-controller-container">
                        <RotaryController deckId="deck2" isEditing={isEditing} activeJointId={activeJointId} />
                    </div>
                    <button className={classNames('corner-tool-button', 'top-left', { 'active': activeCornerTools.right === 'ROT' })} onClick={() => handleCornerToolClick('ROT')}>ROT</button>
                    <button className={classNames('corner-tool-button', 'top-right', { 'active': activeCornerTools.right === 'NRG' })} onClick={() => handleCornerToolClick('NRG')}>NRG</button>
                    <button className={classNames('corner-tool-button', 'bottom-left', { 'active': activeCornerTools.right === 'INT' })} onClick={() => handleCornerToolClick('INT')}>INT</button>
                    <button className="corner-tool-button bottom-right" onClick={() => handleCornerToolClick('BLANK')}></button>
                </div>
                
                <div className="pads-group">
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
                                side="right"
                            />
                        );
                    })}
                </div>
            </div>
            <CornerToolPanel side="right" />
        </div>
    );
};

RightDeck.propTypes = {
    onPadEvent: PropTypes.func.isRequired,
};

export default RightDeck;