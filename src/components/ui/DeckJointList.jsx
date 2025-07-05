import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import CircularBpmControl from './CircularBpmControl';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { editMode, setEditMode } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    return (
        <div className="deck-joint-list-container">
            {/* The joint buttons are now rendered directly inside the container */}
            {jointsForSide.map(joint => {
                const isFootButton = joint.id.endsWith('F');
                const handleShortClick = () => setEditMode(prev => (prev === side ? 'none' : side));
                const handleLongPress = () => setEditMode('both');
                const longPressEvents = isFootButton ? useLongPress(handleShortClick, handleLongPress) : {};
                const regularClickEvent = !isFootButton ? { onClick: () => setEditMode('none') } : {};
                const isSelected = isFootButton && (editMode === side || editMode === 'both');
                
                return (
                    <button 
                        key={joint.id} 
                        className={`joint-list-btn ${isSelected ? 'selected' : ''}`}
                        {...longPressEvents}
                        {...regularClickEvent}
                    >
                        {joint.id}
                    </button>
                );
            })}

            {/* The BPM control is also a direct child, so 'gap' will apply to it */}
            {side === 'right' && (
                <CircularBpmControl />
            )}
        </div>
    );
};

export default DeckJointList;