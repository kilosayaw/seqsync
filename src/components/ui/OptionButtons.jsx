// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
        previewMode, cyclePreviewMode // Use new state and cycler
    } = useUIState();

    const handlePadModeToggle = () => setPadMode(p => p === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    const handlePanelToggle = (panel) => setActivePanel(p => p === panel ? 'none' : panel);
    
    // Get the label for the preview button
    const getPreviewLabel = () => {
        if (previewMode === '2d') return '2D';
        if (previewMode === '3d') return '3D';
        return 'PREVIEW';
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