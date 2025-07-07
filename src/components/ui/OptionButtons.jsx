// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

// The component now receives a 'side' prop to know which buttons to render
const OptionButtons = ({ side }) => {
    const { noteDivision, setNoteDivision, padDisplayMode, setPadDisplayMode } = useUIState();

    const handleNoteDivisionCycle = () => {
        const divisions = [16, 8, 4];
        const currentIndex = divisions.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % divisions.length;
        setNoteDivision(divisions[nextIndex]);
    };

    const handleDisplayModeClick = (mode) => {
        setPadDisplayMode(mode);
    };

    // Render buttons for the Left Deck
    if (side === 'left') {
        return (
            <div className="option-buttons-container">
                <button className="option-btn" onClick={handleNoteDivisionCycle}>
                    1/{noteDivision}
                </button>
                <div className="option-btn-slot" />
                <div className="option-btn-slot" />
                <div className="option-btn-slot" />
            </div>
        );
    }

    // Render buttons for the Right Deck
    if (side === 'right') {
        return (
            <div className="option-buttons-container">
                <button className={classNames('option-btn', { active: padDisplayMode === 'foot' })} onClick={() => handleDisplayModeClick('foot')}>
                    FOOT
                </button>
                <button className={classNames('option-btn', { active: padDisplayMode === 'pose' })} onClick={() => handleDisplayModeClick('pose')}>
                    POSE
                </button>
                 <button className={classNames('option-btn', { active: padDisplayMode === 'abbr' })} onClick={() => handleDisplayModeClick('abbr')}>
                    ABBR
                </button>
                <div className="option-btn-slot" />
            </div>
        );
    }
    
    return null; // Should not happen
};

export default OptionButtons;