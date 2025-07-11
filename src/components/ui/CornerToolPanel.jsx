import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './CornerToolPanel.css';

// The master list of options for each tool type
const OPTIONS = {
    ROT: ['IN', 'OUT', 'NEU', 'SUP', 'PRO', 'EXT', 'FLEX'],
    NRG: ['COMING SOON'], // Placeholder for future feature
    INT: ['CONTACT', 'HOLD', 'FORCE'],
};

const CornerToolPanel = ({ side }) => {
    // Get all necessary state and functions from the contexts
    const { activeCornerTool, activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();

    // If no tool is active or no joint/pad is selected, render nothing.
    if (!OPTIONS[activeCornerTool] || selectedJoints.length === 0 || activePad === null) {
        return null;
    }

    const activeJointId = selectedJoints[0];
    
    // Maps the tool name to the property key in our data model
    const propertyMap = {
        ROT: 'rotationType',
        NRG: 'energyType',
        INT: 'intentType',
    };
    
    const currentProperty = propertyMap[activeCornerTool];
    const jointData = songData[activePad]?.joints?.[activeJointId];

    // Get the current value for the active property (e.g., 'IN', 'OUT', 'PASS', etc.)
    const currentValue = jointData?.[currentProperty] || '';
    
    // Get the current forceLevel for the slider, defaulting to 0
    const forceLevel = jointData?.forceLevel || 0;

    // Handler for when a main option button is clicked
    const handleOptionClick = (option) => {
        if (activeCornerTool === 'NRG') return; // Disable clicks for the placeholder
        updateJointData(activePad, activeJointId, { [currentProperty]: option });
    };

    // Handler for when the force level slider is changed
    const handleForceChange = (e) => {
        const newLevel = parseInt(e.target.value, 10);
        updateJointData(activePad, activeJointId, { forceLevel: newLevel });
    };

    return (
        <div className="corner-tool-panel">
            <div className="panel-header">{activeCornerTool}</div>
            <div className="panel-options">
                {/* DEFINITIVE: This is the complete button mapping logic. */}
                {/* It iterates over the options for the currently active tool. */}
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

            {/* Conditionally render the "Pocket" slider for the ROT tool */}
            {activeCornerTool === 'ROT' && (
                <div className="pocket-slider-container">
                    <label>Pocket</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.5"
                        value={jointData?.rotationPocket || 0.5}
                        onChange={(e) => updateJointData(activePad, activeJointId, { rotationPocket: parseFloat(e.target.value) })}
                    />
                </div>
            )}

            {/* Conditionally render the "Force" slider only when INT tool is active AND 'FORCE' is selected */}
            {activeCornerTool === 'INT' && currentValue === 'FORCE' && (
                <div className="pocket-slider-container">
                    <label>Force</label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={forceLevel}
                        onChange={handleForceChange}
                    />
                    <span>{forceLevel}</span>
                </div>
            )}
        </div>
    );
};

export default CornerToolPanel;