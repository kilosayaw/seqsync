// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    const { noteDivision, setNoteDivision, activePanel, setActivePanel } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        const currentIndex = divisions.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % divisions.length;
        const newDivision = divisions[nextIndex];
        console.log(`[Options] Cycling Note Division to: 1/${newDivision}`);
        setNoteDivision(newDivision);
    };
    
    // This function now toggles the panel visibility
    const handlePanelToggle = (panelName) => {
        const newPanel = activePanel === panelName ? 'none' : panelName;
        console.log(`[Options] Setting active panel to: ${newPanel}`);
        setActivePanel(newPanel);
    };

    // Render buttons for the Left Deck
    if (side === 'left') {
        return (
            <div className="option-buttons-container">
                <button className="option-btn" onClick={handleNoteDivisionCycle}>
                    1/{noteDivision}
                </button>
                {/* NEW "SOUND" BUTTON */}
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>
                    SOUND
                </button>
                <div className="option-btn-slot" />
                <div className="option-btn-slot" />
            </div>
        );
    }

    // Render buttons for the Right Deck
    if (side === 'right') {
        return (
            <div className="option-buttons-container">
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>
                    FOOT
                </button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>
                    POSE
                </button>
                 <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>
                    ABBR
                </button>
                <div className="option-btn-slot" />
            </div>
        );
    }
    
    return null;
};
export default OptionButtons;