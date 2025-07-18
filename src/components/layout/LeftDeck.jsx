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
import DirectionalControls from '../ui/DirectionalControls'; // --- ADDED ---
import { useUIState } from '../../context/UIStateContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSequence } from '../../context/SequenceContext';
import { DEFAULT_POSE } from '../../utils/constants';
import classNames from 'classnames';
import './Deck.css';

const LeftDeck = ({ onPadEvent }) => {
    const { 
        selectedBar, activePad, selectedJoints, 
        activeCornerTools, setActiveCornerTools, jointEditMode, movementFaderValues
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
    
    const handlePositionChange = (newGridPosition) => {
        if (!activeJointId) return;

        const [gridX, gridY, gridZ] = newGridPosition;
        const defaultPosition = DEFAULT_POSE.jointInfo[activeJointId]?.vector || {x:0, y:0, z:0};
        
        if (gridX === 0 && gridY === 0 && gridZ === 0) {
            updateJointData(activePad, activeJointId, { 
                position: [0, 0, 0],
                vector: defaultPosition 
            });
            return;
        }

        const MAX_DISPLACEMENT = 0.5; 
        const faderValue = movementFaderValues.left;
        const finalVector = {
            x: defaultPosition.x + (gridX * MAX_DISPLACEMENT * faderValue),
            y: defaultPosition.y + (gridY * MAX_DISPLACEMENT * faderValue),
            z: defaultPosition.z + (gridZ * MAX_DISPLACEMENT * faderValue)
        };

        updateJointData(activePad, activeJointId, { 
            position: newGridPosition, 
            vector: finalVector 
        });
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
                    <DirectionalControls />
                <div className={classNames('turntable-group', { 'is-editing': isEditing })}>
                    <RotaryController deckId="deck1" isEditing={isEditing || isRotationMode} activeJointId={activeJointId} />
                    {showPositionGrid && (
                        <div className="xyz-grid-overlay">
                            <XYZGrid 
                                position={livePosition} 
                                onPositionChange={handlePositionChange} 
                            />
                        </div>
                    )}
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