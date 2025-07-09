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
        activeVisualizer, setActiveVisualizer // Use new state
    } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        setNoteDivision(d => divisions[(divisions.indexOf(d) + 1) % divisions.length]);
    };
    const handlePadModeToggle = () => setPadMode(p => p === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    const handlePanelToggle = (panel) => setActivePanel(p => p === panel ? 'none' : panel);

    const handleVisualizerToggle = (viz) => setActiveVisualizer(prev => prev === viz ? 'none' : viz);

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
    
    if (side === 'right') {
        return (
            <>
                <button className={classNames('option-btn', { active: activeVisualizer === 'full' })} onClick={() => handleVisualizerToggle('full')}>PREVIEW</button>
                <button className={classNames('option-btn', { active: activePanel === 'foot' })} onClick={() => handlePanelToggle('foot')}>FOOT</button>
                <button className={classNames('option-btn', { active: activeVisualizer === 'core' })} onClick={() => handleVisualizerToggle('core')}>POSE</button>
                <button className={classNames('option-btn', { active: activePanel === 'abbr' })} onClick={() => handlePanelToggle('abbr')}>ABBR</button>
            </>
        );
    }

    return null;
};
export default OptionButtons;