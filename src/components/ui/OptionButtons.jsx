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
        activePresetPage, setActivePresetPage // Get preset page state
    } = useUIState();

    const handlePadModeToggle = () => {
        setPadMode(currentMode => (currentMode === 'TRIGGER' ? 'GATE' : 'TRIGGER'));
    };

    const handlePanelToggle = (panelName) => {
        setActivePanel(currentPanel => (currentPanel === panelName ? 'none' : panelName));
    };

    const handlePageChange = (pageIndex) => {
        setActivePresetPage(prev => ({ ...prev, [side]: pageIndex }));
    };

    // New component for the preset page selectors
    const PresetPageSelectors = () => (
        <div className="preset-page-selectors">
            {[0, 1, 2].map(i => (
                <button
                    key={`page-${i}`}
                    className={classNames('page-btn', { 'active': activePresetPage[side] === i })}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );

    if (side === 'left') {
        return (
            <>
                <PresetPageSelectors />
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
                <PresetPageSelectors />
                <button className={classNames('option-btn', { active: previewMode !== 'off' })} onClick={cyclePreviewMode}>VIEW</button>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </>
        );
    }

    return null;
};
export default OptionButtons;