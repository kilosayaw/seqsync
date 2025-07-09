// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

// DEFINITIVE: Component now takes a 'side' prop to render the correct set of buttons.
const OptionButtons = ({ side }) => {
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
        isPreviewMode, togglePreviewMode,
        coreViewMode, toggleCoreView
    } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        setNoteDivision(d => divisions[(divisions.indexOf(d) + 1) % divisions.length]);
    };
    const handlePadModeToggle = () => setPadMode(p => p === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    const handlePanelToggle = (panel) => setActivePanel(p => p === panel ? 'none' : panel);

    if (side === 'left') {
        return (
            <>
                <button className="option-btn" onClick={handleNoteDivisionCycle}>1/{noteDivision}</button>
                <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
                <button className={classNames('option-btn', { active: isPreviewMode })} onClick={togglePreviewMode}>PREVIEW</button>
            </>
        );
    }
    
    if (side === 'right') {
        return (
            <>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className="option-btn" onClick={toggleCoreView}>{coreViewMode.toUpperCase()}</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
            </>
        );
    }

    return null;
};
export default OptionButtons;