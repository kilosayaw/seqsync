import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    // DEFINITIVE FIX: Removed cycleVisualizerMode from the context, as it's no longer needed.
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
    } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [8, 4, 2];
        const currentIndex = divisions.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % divisions.length;
        setNoteDivision(divisions[nextIndex]);
    };

    const handlePadModeToggle = () => {
        setPadMode(currentMode => (currentMode === 'TRIGGER' ? 'GATE' : 'TRIGGER'));
    };

    const handlePanelToggle = (panelName) => {
        setActivePanel(currentPanel => (currentPanel === panelName ? 'none' : panelName));
    };
    
    // Render the left stack of buttons
    if (side === 'left') {
        return (
            <>
                <button className="option-btn" onClick={handleNoteDivisionCycle}>CYCLE</button>
                <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
            </>
        );
    }
    
    // Render the right stack of buttons
    if (side === 'right') {
        return (
            <>
                {/* DEFINITIVE FIX: The conflicting PREVIEW/FULL/CORE button has been removed. */}
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </>
        );
    }

    return null;
};

export default OptionButtons;