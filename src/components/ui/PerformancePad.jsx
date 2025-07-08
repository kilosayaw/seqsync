// src/components/ui/PerformancePad.jsx
import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import './PerformancePad.css';

const PerformancePad = ({ padIndex, isPulsing, onPadClick, beatData }) => {
    const { selectedBeat } = useSequence();
    const isSelected = selectedBeat === padIndex;
    const hasData = beatData?.pose || beatData?.sounds?.length > 0;

    // Determine color group based on pad index
    let groupClass = 'pad-group-4'; // Default to cream/white
    if (padIndex < 4) groupClass = 'pad-group-1'; // Red
    else if (padIndex < 8) groupClass = 'pad-group-2'; // Orange
    else if (padIndex < 12) groupClass = 'pad-group-3'; // Yellow
    
    const classes = [
        'performance-pad',
        groupClass,
        isSelected && 'selected',
        isPulsing && 'pulsing',
        hasData && 'has-data',
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