import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './CornerToolPanel.css';

const OPTIONS = {
    ROT: ['IN', 'OUT', 'NEU', 'SUP', 'PRO', 'EXT', 'FLEX'],
    NRG: ['COMING SOON'],
    INT: ['PASS', 'BASE', 'FORCE'],
};

const CornerToolPanel = ({ side }) => {
    const { activeCornerTool, activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();

    if (!OPTIONS[activeCornerTool] || selectedJoints.length === 0 || activePad === null) {
        return null;
    }

    const activeJointId = selectedJoints[0];
    const propertyMap = {
        ROT: 'rotationType',
        NRG: 'energyType',
        INT: 'intentType',
    };
    const currentProperty = propertyMap[activeCornerTool];
    const currentValue = songData[activePad]?.joints?.[activeJointId]?.[currentProperty] || '';

    const handleOptionClick = (option) => {
        if (activeCornerTool === 'NRG') return;
        updateJointData(activePad, activeJointId, { [currentProperty]: option });
    };

    return (
        <div className="corner-tool-panel">
            <div className="panel-header">{activeCornerTool}</div>
            <div className="panel-options">
                {OPTIONS[activeCornerTool].map(option => (
                    <button
                        key={option}
                        className={`option-item ${currentValue === option ? 'active' : ''}`}
                        onClick={() => handleOptionClick(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CornerToolPanel;