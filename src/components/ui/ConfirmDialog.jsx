// src/components/ui/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ message, onConfirm, onCancel, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <p className="dialog-message">{message}</p>
                <div className="dialog-buttons">
                    <button className="dialog-btn confirm-btn" onClick={onConfirm}>Confirm</button>
                    <button className="dialog-btn cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmDialog;