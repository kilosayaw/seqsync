import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './CornerToolPanel.css';

const OPTIONS = {
    ROT: ['IN', 'OUT', 'NEU', 'SUP', 'PRO', 'EXT', 'FLEX'],
    NRG: ['COMING SOON'],
    INT: ['BASE', 'FORCE'],
};

const CornerToolPanel = ({ side }) => {
    const { activeCornerTools, setActiveCornerTools, activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();
    
    const activeTool = activeCornerTools[side];
    const relevantJoints = selectedJoints.filter(j => j.startsWith(side.charAt(0).toUpperCase()));

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

    const propertyMap = { ROT: 'orientation', INT: 'intentType' };
    const currentProperty = propertyMap[activeTool];
    const jointData = songData[activePad]?.joints?.[relevantJoints[0]];
    const currentValue = jointData?.[currentProperty] || 'BASE';
    
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
                        onClick={() => handleOptionClick(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
            
            {activeTool === 'INT' && currentValue === 'FORCE' && (
                <div className="pocket-slider-container">
                    <label>Force</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="10" 
                        value={jointData?.forceLevel || 0} 
                        onChange={(e) => relevantJoints.forEach(jointId => updateJointData(activePad, jointId, { forceLevel: parseInt(e.target.value, 10) }))} 
                    />
                    <span>{jointData?.forceLevel || 0}</span>
                </div>
            )}
        </div>
    );
};
export default CornerToolPanel;