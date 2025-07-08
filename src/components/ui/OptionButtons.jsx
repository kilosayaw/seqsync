// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = () => {
    const { noteDivision, setNoteDivision, padMode, setPadMode, activePanel, setActivePanel } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        const currentIndex = divisions.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % divisions.length;
        setNoteDivision(divisions[nextIndex]);
    };
    
    const handlePanelToggle = (panelName) => {
        setActivePanel(prev => prev === panelName ? 'none' : panelName);
    };

    const handlePadModeToggle = () => {
        setPadMode(prev => prev === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    };

    return (
        <div className="option-buttons-container">
            {/* Options 1-4 */}
            <button className="option-btn" onClick={handleNoteDivisionCycle}>1/{noteDivision}</button>
            <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
            <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
            <div className="option-btn-slot" />
            
            {/* Options 5-8 */}
            <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
            <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
            <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
        </div>
    );
};
export default OptionButtons;