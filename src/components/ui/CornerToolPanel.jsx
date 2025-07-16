import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './CornerToolPanel.css';

const OPTIONS = {
    ROT: ['IN', 'OUT', 'NEU', 'SUP', 'PRO', 'EXT', 'FLEX'],
    NRG: ['COMING SOON'],
    INT: ['CONTACT', 'HOLD', 'FORCE'],
};

const CornerToolPanel = ({ side }) => {
    const { activeCornerTools, setActiveCornerTools, activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();
    
    const activeTool = activeCornerTools[side];
    const relevantJoint = selectedJoints.find(j => j.startsWith(side.charAt(0).toUpperCase()));

    const handleClose = () => {
        setActiveCornerTools(prev => ({ ...prev, [side]: 'none' }));
    };
    
    const handleOptionClick = (property, value) => {
        if (activePad === null || !relevantJoint) return;
        updateJointData(activePad, relevantJoint, { [property]: value });
    };

    const handleForceChange = (e) => {
        if (activePad === null || !relevantJoint) return;
        const newLevel = parseInt(e.target.value, 10);
        updateJointData(activePad, relevantJoint, { forceLevel: newLevel });
    };

    if (activeTool === 'none' || !relevantJoint) {
        return null;
    }

    const propertyMap = { ROT: 'orientation', NRG: 'energyType', INT: 'intentType' };
    const currentProperty = propertyMap[activeTool];
    const jointData = songData[activePad]?.joints?.[relevantJoint];
    const currentValue = jointData?.[currentProperty] || '';
    const forceLevel = jointData?.forceLevel || 0;

    return (
        <div className="corner-tool-panel-modal">
            <div className="modal-header">
                <h4>{activeTool}</h4>
                <button className="modal-close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="panel-options">
                {OPTIONS[activeTool].map(option => (
                    <button
                        key={option}
                        className={classNames('option-item', { 'active': currentValue === option })}
                        onClick={() => handleOptionClick(currentProperty, option)}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {activeTool === 'ROT' && (
                <div className="pocket-slider-container">
                    <label>Pocket</label>
                    <input type="range" min="0" max="1" step="0.5" value={jointData?.rotationPocket || 0.5} onChange={(e) => handleOptionClick('rotationPocket', parseFloat(e.target.value))} />
                </div>
            )}

            {activeTool === 'INT' && currentValue === 'FORCE' && (
                <div className="pocket-slider-container">
                    <label>Force</label>
                    <input type="range" min="0" max="10" step="1" value={forceLevel} onChange={handleForceChange} />
                    <span>{forceLevel}</span>
                </div>
            )}
        </div>
    );
};
export default CornerToolPanel;