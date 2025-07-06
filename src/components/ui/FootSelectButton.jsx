import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useLongPress } from '../../hooks/useLongPress';
import './CircularBpmControl.css'; // We can reuse the same CSS

const FootSelectButton = () => {
    const { editMode, setEditMode } = useUIState();

    // Define the short-press and long-press behaviors
    const handleShortClick = () => setEditMode(prev => (prev === 'left' ? 'none' : 'left'));
    const handleLongPress = () => setEditMode('both');
    const longPressEvents = useLongPress(handleShortClick, handleLongPress);

    const isSelected = editMode === 'left' || editMode === 'both';
    
    return (
        <button 
            className={`circular-bpm-button ${isSelected ? 'selected' : ''}`} 
            title="Short Press: Select Left Foot. Long Press: Select Both."
            {...longPressEvents}
        >
            <span className="circular-bpm-value">LF</span>
        </button>
    );
};

export default FootSelectButton;