// src/components/layout/LeftDeck.jsx
import React from 'react';
import PropTypes from 'prop-types';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import PresetPageSelectors from '../ui/PresetPageSelectors';
import CornerToolPanel from '../ui/CornerToolPanel';
import XYZGrid from '../ui/XYZGrid'; // DEFINITIVE: Import your XYZGrid
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './Deck.css';

const LeftDeck = ({ onPadEvent }) => {
    const { selectedBar, activePad, selectedJoints, activeCornerTools, setActiveCornerTools, movementFaderValues } = useUIState();
    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { STEPS_PER_BAR, songData, updateJointVectorForActivePad } = useSequence();

    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith('L'));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;

    const activePose = songData[activePad];
    const activeVectorData = activeJointId && activePose?.joints?.[activeJointId]?.vector;
    const activePosition = activeVectorData ? [activeVectorData.x, activeVectorData.y, activeVectorData.z] : [0, 0, 0];

    const handleCornerToolClick = (toolName) => {
        setActiveCornerTools(prev => ({ ...prev, left: prev.left === toolName ? 'none' : toolName }));
    };

    const handlePositionChange = (newPosition) => {
        if (activeJointId) {
            const increment = movementFaderValues.left;
            // The position from XYZGrid is scaled by the fader value
            const newVector = { 
                x: newPosition[0] * increment, 
                y: newPosition[1] * increment, 
                z: newPosition[2] // Z is not scaled by the fader, it's a direct state from the grid
            };
            updateJointVectorForActivePad(activeJointId, newVector);
        }
    };
    
    return (
        <div className="deck-wrapper">
            <div className="deck-container" data-side="left">
                <DeckJointList side="left" />
                <div className="side-controls-column">
                    <MovementFader side="left" />
                    <OptionButtons side="left" />
                    <PresetPageSelectors side="left" />
                </div>
                {/* DEFINITIVE: DirectionalControls is removed. The layout is now correct. */}
                <div className={classNames('turntable-group', { 'is-editing': isEditing })}>
                    <div className="rotary-controller-container">
                        <RotaryController deckId="deck1" isEditing={isEditing} activeJointId={activeJointId} />
                    </div>
                    {/* DEFINITIVE: XYZGrid is now the interactive overlay, appearing only when editing. */}
                    {isEditing && <XYZGrid position={activePosition} onPositionChange={handlePositionChange} />}
                    <button className={classNames('corner-tool-button', 'top-left', { 'active': activeCornerTools.left === 'ROT' })} onClick={() => handleCornerToolClick('ROT')}>ROT</button>
                    <button className={classNames('corner-tool-button', 'top-right', { 'active': activeCornerTools.left === 'NRG' })} onClick={() => handleCornerToolClick('NRG')}>NRG</button>
                    <button className={classNames('corner-tool-button', 'bottom-left', { 'active': activeCornerTools.left === 'INT' })} onClick={() => handleCornerToolClick('INT')}>INT</button>
                    <button className="corner-tool-button bottom-right" onClick={() => handleCornerToolClick('BLANK')}></button>
                </div>
                <div className="pads-group">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + i;
                        return (<PerformancePad key={`left-${i}`} padIndex={globalPadIndex} beatNum={i + 1} isPulsing={isPlaying && selectedBar === currentBar && i === currentBeat} isSelected={activePad === globalPadIndex} onMouseDown={() => onPadEvent('down', globalPadIndex)} onMouseUp={() => onPadEvent('up', globalPadIndex)} onMouseLeave={() => onPadEvent('up', globalPadIndex)} side="left"/>);
                    })}
                </div>
            </div>
            <CornerToolPanel side="left" />
        </div>
    );
};
LeftDeck.propTypes = { onPadEvent: PropTypes.func.isRequired };
export default LeftDeck;