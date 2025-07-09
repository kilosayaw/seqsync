// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    const { noteDivision, setNoteDivision, padMode, setPadMode, activePanel, setActivePanel } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        setNoteDivision(d => divisions[(divisions.indexOf(d) + 1) % divisions.length]);
    };
    const handlePadModeToggle = () => setPadMode(p => p === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    const handlePanelToggle = (panel) => setActivePanel(p => p === panel ? 'none' : panel);

    // DEFINITIVE FIX: Render a different set of buttons based on the 'side' prop.
    if (side === 'left') {
        return (
            <div className="option-buttons-container">
                <button className="option-btn" onClick={handleNoteDivisionCycle}>1/{noteDivision}</button>
                <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
            </div>
        );
    }
    
    if (side === 'right') {
        return (
            <div className="option-buttons-container">
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
                <div className="option-btn-slot" /> {/* Option 8 is open */}
            </div>
        );
    }

    return null; // Should not happen
};
export default OptionButtons;