// src/components/ui/OptionButtons.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './OptionButtons.css';

const OptionButtons = () => {
    const { noteDivision, setNoteDivision } = useUIState();

    const handleToggle = () => {
        const newDivision = noteDivision === 16 ? 8 : 16;
        console.log(`[Options] Toggling Note Division to: 1/${newDivision}`);
        setNoteDivision(newDivision);
    };

    return (
        <div className="option-buttons-container">
            <button 
                className={classNames('option-btn', { 'active': noteDivision === 16 })}
                onClick={noteDivision === 8 ? handleToggle : undefined}
            >
                1/16
            </button>
            <button 
                className={classNames('option-btn', { 'active': noteDivision === 8 })}
                onClick={noteDivision === 16 ? handleToggle : undefined}
            >
                1/8
            </button>
            <div className="option-btn-slot" />
            <div className="option-btn-slot" />
        </div>
    );
};
export default OptionButtons;