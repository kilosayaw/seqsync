import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
        previewMode, cyclePreviewMode,
    } = useUIState();

    const handlePadModeToggle = () => {
        setPadMode(currentMode => (currentMode === 'TRIGGER' ? 'GATE' : 'TRIGGER'));
    };

    const handlePanelToggle = (panelName) => {
        setActivePanel(currentPanel => (currentPanel === panelName ? 'none' : panelName));
    };
    
    const getPreviewLabel = () => {
        if (previewMode === '2d') return 'VIEW: 2D';
        if (previewMode === '3d') return 'VIEW: 3D';
        return 'VIEW: OFF';
    };

    // DEFINITIVE FIX: The locally defined PresetPageSelectors sub-component has been removed.
    // The main component now only renders the main options stack.

    if (side === 'left') {
        return (
            <div className="main-options-stack">
                <button className="option-btn" onClick={() => setNoteDivision(d => d === 8 ? 4 : 8)}>1/{noteDivision}</button>
                <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
            </div>
        );
    }
    
    if (side === 'right') {
        return (
            <div className="main-options-stack">
                <button className={classNames('option-btn', { active: previewMode !== 'off' })} onClick={cyclePreviewMode}>{getPreviewLabel()}</button>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </div>
        );
    }

    return null;
};

export default OptionButtons;