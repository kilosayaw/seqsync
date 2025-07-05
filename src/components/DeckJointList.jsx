// src/components/DeckJointList.jsx
import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import { useLongPress } from '../hooks/useLongPress'; // Import the new hook
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint, editMode, setEditMode } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    const handleFootClick = (jointId) => {
        const targetSide = jointId.startsWith('L') ? 'left' : 'right';
        // Toggle 'editMode' for the specific side
        setEditMode(prev => prev === targetSide ? 'none' : targetSide);
        // Toggle the 'selectedJoint' as well for visual feedback
        setSelectedJoint(prev => prev === jointId ? null : jointId);
    };

    const handleFootLongPress = () => {
        // Long press always activates 'both' edit mode
        setEditMode('both');
        // Select both foot joints for visual feedback
        setSelectedJoint('both_feet'); 
    };

    const handleRegularJointClick = (jointId) => {
        // Regular joints just set the selected joint and turn off foot editing
        setSelectedJoint(prev => prev === jointId ? null : jointId);
        setEditMode('none');
    };

    return (
        <div className="deck-joint-list-container">
            {jointsForSide.map(joint => {
                const isFootButton = joint.id.endsWith('F');
                let isSelected = false;

                if (editMode === 'both' && isFootButton) {
                    // If in 'both' mode, both foot buttons are active
                    isSelected = true;
                } else {
                    // Otherwise, a button is active if it's the selected one
                    isSelected = selectedJoint === joint.id;
                }

                // Use the long-press hook only for foot buttons
                const longPressEvents = isFootButton
                    ? useLongPress(() => handleFootClick(joint.id), handleFootLongPress)
                    : {};
                
                return (
                    <button 
                        key={joint.id} 
                        className={`joint-list-btn ${isSelected ? 'selected' : ''}`}
                        // Assign the correct handler based on the button type
                        {...(isFootButton ? longPressEvents : { onClick: () => handleRegularJointClick(joint.id) })}
                    >
                        {joint.name}
                    </button>
                );
            })}
        </div>
    );
};

export default DeckJointList;