// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = ({ side }) => {
    // Get all necessary state and functions from the UI context
    const { 
        noteDivision, setNoteDivision, 
        padMode, setPadMode, 
        activePanel, setActivePanel, 
        activeVisualizer, cycleVisualizerMode 
    } = useUIState();

    // Define handlers for button actions
    const handleNoteDivisionCycle = () => {
        const divisions = [8, 4, 2]; // The available note divisions
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
    
    // Determine the correct label for the multi-state preview button
    const getPreviewLabel = () => {
        if (activeVisualizer === 'full') return 'FULL';
        if (activeVisualizer === 'core') return 'CORE';
        return 'PREVIEW';
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
                <button 
                    className={classNames('option-btn', { active: activeVisualizer !== 'none' })} 
                    onClick={cycleVisualizerMode}
                >
                    {getPreviewLabel()}
                </button>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activePanel === 'pose' })} onClick={() => handlePanelToggle('pose')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </>
        );
    }

    return null; // Should not happen if 'side' prop is always provided
};

export default OptionButtons;