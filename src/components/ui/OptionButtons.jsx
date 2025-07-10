import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    // DEFINITIVE: Destructure all necessary state and functions from the context.
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
        previewMode, cyclePreviewMode
    } = useUIState();

    const getPreviewLabel = () => {
        if (previewMode === '2d') return '2D';
        if (previewMode === '3d') return '3D';
        return 'PREVIEW';
    };

    // DEFINITIVE FIX: Define the missing event handlers.
    const handlePadModeToggle = () => {
        setPadMode(currentMode => (currentMode === 'TRIGGER' ? 'GATE' : 'TRIGGER'));
    };

    const handlePanelToggle = (panelName) => {
        setActivePanel(currentPanel => (currentPanel === panelName ? 'none' : panelName));
    };

    if (side === 'left') {
        return (
            <>
                <button className="option-btn" onClick={() => setNoteDivision(d => d === 8 ? 4 : 8)}>1/{noteDivision}</button>
                <button className="option-btn" onClick={handlePadModeToggle}>{padMode}</button>
                <button className={classNames('option-btn', { active: activePanel === 'sound' })} onClick={() => handlePanelToggle('sound')}>SOUND</button>
                <button className={classNames('option-btn', { active: activePanel === 'mixer' })} onClick={() => handlePanelToggle('mixer')}>MIXER</button>
            </>
        );
    }
    
    if (side === 'right') {
        return (
            <>
                <button className={classNames('option-btn', { active: previewMode !== 'off' })} onClick={cyclePreviewMode}>{getPreviewLabel()}</button>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </>
        );
    }

    return null;
};
export default OptionButtons;