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
        setNoteDivision(divisions[nextIndex]);
    };
    
    const handlePanelToggle = (panelName) => {
        setActivePanel(prev => prev === panelName ? 'none' : panelName);
    };

    if (side === 'left') {
        return (
            <div className="option-buttons-container">
                <button className="option-btn" onClick={handleNoteDivisionCycle}>
                    1/{noteDivision}
                </button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>
                    SOUND
                </button>
                {/* DEFINITIVE FIX: Mixer is now button 3 */}
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>
                    MIXER
                </button>
                <div className="option-btn-slot" />
            </div>
        );
    }

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