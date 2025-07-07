// src/components/ui/DeckJointList.jsx

import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import CircularBpmControl from './CircularBpmControl';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { editMode, setEditMode } = useUIState();
    
    // Filter the master list to get joints for the specified side (L or R)
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    return (
        <div className="deck-joint-list-container">
            {/* Wrapper for standard joint buttons */}
            <div className="joint-buttons-wrapper">
                {jointsForSide.map(joint => {
                    const isFootButton = joint.id.endsWith('F');

                    // A button is selected if its side matches the edit mode,
                    // or if the mode is 'both' and it's a foot button.
                    const isSelected = isFootButton && (editMode === side || editMode === 'both');

                    const handleShortClick = () => {
                        // A short click on a foot toggles that side's edit mode on/off.
                        setEditMode(prev => (prev === side ? 'none' : side));
                    };
                    
                    const handleLongPress = () => {
                        // A long press on a foot always sets the mode to 'both'.
                        setEditMode('both');
                    };

                    // Only foot buttons get the long-press functionality.
                    const longPressEvents = isFootButton ? useLongPress(handleShortClick, handleLongPress) : {};
                    // Non-foot buttons do nothing on click for now (this can be changed later).
                    const regularClickEvent = !isFootButton ? { onClick: () => { /* No action */ } } : {};
                    
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
            </div>

            {/* Conditionally render the BPM control ONLY for the right deck */}
            {side === 'right' && (
                <div className="bpm-control-wrapper">
                    <CircularBpmControl />
                </div>
            )}
        </div>
    );
};

export default DeckJointList;