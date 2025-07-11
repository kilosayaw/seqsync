// src/components/ui/PivotControl.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './PivotControl.css';

const PivotControl = ({ side }) => {
    const { activePad } = useUIState();
    const { songData, updateJointData } = useSequence();
    
    const sidePrefix = side.charAt(0).toUpperCase();
    const footJointId = `${sidePrefix}F`;

    const currentPivot = songData[activePad]?.joints?.[footJointId]?.pivotPoint || `${sidePrefix}3`;

    const handlePivotChange = (pivotId) => {
        if (activePad !== null) {
            updateJointData(activePad, footJointId, { pivotPoint: pivotId });
        }
    };

    return (
        <div className="pivot-control-container">
            <div className="pivot-label">PIV</div>
            <div className="pivot-buttons">
                {['1', '2', '3'].map(num => {
                    const pivotId = `${sidePrefix}${num}`;
                    return (
                        <button
                            key={pivotId}
                            className={`pivot-btn ${currentPivot === pivotId ? 'active' : ''}`}
                            onClick={() => handlePivotChange(pivotId)}
                        >
                            {sidePrefix}{num}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PivotControl;