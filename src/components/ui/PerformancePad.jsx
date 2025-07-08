// src/components/ui/PerformancePad.jsx
import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import './PerformancePad.css';

const PerformancePad = ({ padIndex, isPulsing, onPadClick, beatData }) => {
    const { selectedBeat } = useSequence();
    const isSelected = selectedBeat === padIndex;
    const hasPose = beatData?.pose;

    const classes = [
        'performance-pad',
        isSelected ? 'selected' : '',
        isPulsing ? 'pulsing' : '',
        hasPose ? 'has-data' : '',
    ].filter(Boolean).join(' ');

    return (
        <button 
            className={classes}
            onMouseDown={() => onPadClick(padIndex)}
        >
            {padIndex + 1}
        </button>
    );
};
export default PerformancePad;