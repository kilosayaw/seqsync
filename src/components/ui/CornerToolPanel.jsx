// src/components/ui/CornerToolPanel.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './CornerToolPanel.css';

const OPTIONS = {
    ROT: ['IN', 'OUT', 'NEU', 'SUP', 'PRO', 'EXT', 'FLEX'],
    NRG: ['COMING SOON'],
    // DEFINITIVE: Updated INT options
    INT: ['BASE', 'FORCE'],
};

const CornerToolPanel = ({ side }) => {
    const { activeCornerTools, setActiveCornerTools, activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();
    
    const activeTool = activeCornerTools[side];
    const relevantJoints = selectedJoints.filter(j => j.startsWith(side.charAt(0).toUpperCase()));

    // DEFINITIVE FIX #3: Handler to close the modal.
    const handleClose = () => {
        setActiveCornerTools(prev => ({ ...prev, [side]: 'none' }));
    };
    
    const handleOptionClick = (option) => {
        if (activePad === null || relevantJoints.length === 0) return;

        const propertyMap = { ROT: 'orientation', INT: 'intentType' };
        const propertyToUpdate = propertyMap[activeTool];

        if (propertyToUpdate) {
            relevantJoints.forEach(jointId => {
                updateJointData(activePad, jointId, { [propertyToUpdate]: option });
            });
        }
    };

    if (activeTool === 'none' || relevantJoints.length === 0) {
        return null;
    }

    const propertyMap = { ROT: 'orientation', NRG: 'energyType', INT: 'intentType' };
    const currentProperty = propertyMap[activeTool];
    const jointData = songData[activePad]?.joints?.[relevantJoints[0]];
    const currentValue = jointData?.[currentProperty] || '';
    
    return (
        // DEFINITIVE FIX #2 & #3: The component is now a modal with correct positioning and a close button.
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
                        onClick={() => handleOptionClick(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {/* The logic for sliders is preserved from your original file */}
            {activeTool === 'ROT' && (
                <div className="pocket-slider-container">
                    <label>Pocket</label>
                    <input type="range" min="0" max="1" step="0.5" value={jointData?.rotationPocket || 0.5} onChange={(e) => updateJointData(activePad, relevantJoints[0], { rotationPocket: parseFloat(e.target.value) })} />
                </div>
            )}
            {activeTool === 'INT' && currentValue === 'FORCE' && (
                <div className="pocket-slider-container">
                    <label>Force</label>
                    <input type="range" min="0" max="10" step="1" value={jointData?.forceLevel || 0} onChange={(e) => updateJointData(activePad, relevantJoints[0], { forceLevel: parseInt(e.target.value, 10) })} />
                    <span>{jointData?.forceLevel || 0}</span>
                </div>
            )}
        </div>
    );
};
export default CornerToolPanel;