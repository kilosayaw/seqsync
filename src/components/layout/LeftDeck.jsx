import React from 'react';
import PropTypes from 'prop-types';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import PresetPageSelectors from '../ui/PresetPageSelectors';
import CornerToolPanel from '../ui/CornerToolPanel';
import XYZGrid from '../ui/XYZGrid';
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './Deck.css';

const LeftDeck = ({ onPadEvent }) => {
    const { 
        selectedBar, activePad, selectedJoints, 
        activeCornerTools, setActiveCornerTools, jointEditMode 
    } = useUIState();

    const { isPlaying, currentBar, currentBeat } = usePlayback();
    const { songData, STEPS_PER_BAR, updateJointData } = useSequence();

    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith('L'));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;

    const isFootSelected = activeJointId === 'LF';
    const showPositionGrid = isEditing && !isFootSelected && jointEditMode === 'position';
    const isRotationMode = isEditing && !isFootSelected && jointEditMode === 'rotation';

    const liveJointData = songData[activePad]?.joints?.[activeJointId] || {};
    const livePosition = liveJointData.position || [0, 0, 0];
    
    const handlePositionChange = (newPositionArray) => {
        if (!activeJointId) return;
        const newVector = { x: newPositionArray[0], y: newPositionArray[1], z: newPositionArray[2] };
        updateJointData(activePad, activeJointId, { position: newPositionArray, vector: newVector });
    };
    
    const handleCornerToolClick = (toolName) => {
        if (toolName === 'BLANK') setActiveCornerTools(prev => ({ ...prev, left: 'none' }));
        else setActiveCornerTools(prev => ({ ...prev, left: prev.left === toolName ? 'none' : toolName }));
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
                
                {/* --- DEFINITIVE FIX: The 'is-editing' class is now correctly applied --- */}
                <div className={classNames('turntable-group', { 'is-editing': isEditing })}>
                    <RotaryController 
                        deckId="deck1" 
                        // The controller is always considered "editing" when a joint is selected,
                        // but its internal logic will only allow interaction in the correct mode.
                        isEditing={isEditing} 
                        activeJointId={activeJointId} 
                    />
                    
                    {showPositionGrid && (
                        <div className="xyz-grid-overlay">
                            <XYZGrid 
                                position={livePosition} 
                                onPositionChange={handlePositionChange} 
                            />
                        </div>
                    )}

                    {/* These buttons will now appear correctly whenever 'isEditing' is true */}
                    <button className={classNames('corner-tool-button', 'top-left', { 'active': activeCornerTools.left === 'ROT' })} onClick={() => handleCornerToolClick('ROT')}>ROT</button>
                    <button className={classNames('corner-tool-button', 'top-right', { 'active': activeCornerTools.left === 'NRG' })} onClick={() => handleCornerToolClick('NRG')}>NRG</button>
                    <button className={classNames('corner-tool-button', 'bottom-left', { 'active': activeCornerTools.left === 'INT' })} onClick={() => handleCornerToolClick('INT')}>INT</button>
                    <button className="corner-tool-button bottom-right" onClick={() => handleCornerToolClick('BLANK')}></button>
                </div>
                {/* --- END OF FIX --- */}

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