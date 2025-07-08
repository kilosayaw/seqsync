// src/components/ui/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.css';
import { FaLongArrowAltRight } from 'react-icons/fa';

// The component now accepts an array of 'actions'
const ConfirmDialog = ({ message, actions, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <p className="dialog-message">{message}</p>
                <div className="dialog-buttons">
                    {actions.map((action, index) => (
                        <button 
                            key={index} 
                            className={`dialog-btn ${action.className || ''}`} 
                            onClick={action.onClick}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
                <p className="dialog-footer">
                    You can change this later using the <FaLongArrowAltRight /> <strong>MIXER</strong> button.
                </p>
            </div>
        </div>
    );
};
export default ConfirmDialog;