// src/components/ui/DeckJointList.jsx

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
            <div className="joint-buttons-wrapper">
                {jointsForSide.map(joint => {
                    const isFootButton = joint.id.endsWith('F');
                    
                    if (isFootButton) {
                        // --- THIS IS THE LOGIC FOR THE SPECIAL LF/RF BUTTONS ---

                        // Define the action for a short, single tap
                        const handleShortClick = () => {
                            // If this side is already selected, tapping again deselects it.
                            const newMode = editMode === side ? 'none' : side;
                            console.log(
                                `%c[FootSelect] SHORT PRESS on ${joint.id}. ` +
                                `Setting edit mode from '${editMode}' to '${newMode}'.`,
                                'color: #f0ad4e;' // Orange color for visibility
                            );
                            setEditMode(newMode);
                        };

                        // Define the action for a long press
                        const handleLongPress = () => {
                            console.log(
                                `%c[FootSelect] LONG PRESS on ${joint.id}. ` +
                                `Setting edit mode to 'both'.`,
                                'color: #d9534f;' // Red color for visibility
                            );
                            setEditMode('both');
                        };

                        // Attach the handlers using the long-press hook
                        const longPressEvents = useLongPress(handleShortClick, handleLongPress, { ms: 300 });
                        
                        // Determine if this button should be highlighted
                        const isSelected = editMode === side || editMode === 'both';
                        
                        return (
                            <button 
                                key={joint.id} 
                                className={`joint-list-btn ${isSelected ? 'selected' : ''}`}
                                {...longPressEvents}
                                title={`Short press: edit ${side} foot. Hold: edit both.`}
                            >
                                {joint.id}
                            </button>
                        );

                    } else {
                        // --- This is the logic for all other (non-foot) joint buttons ---
                        const handleRegularClick = () => {
                            console.log(`[JointSelect] Regular joint button '${joint.id}' clicked. Disabling foot edit mode.`);
                            setEditMode('none'); 
                            // Future logic to select this specific joint for editing would go here.
                        };

                        return (
                            <button 
                                key={joint.id} 
                                className="joint-list-btn"
                                onClick={handleRegularClick}
                                title={`Select ${joint.name}`}
                            >
                                {joint.id}
                            </button>
                        );
                    }
                })}
            </div>

            {/* Conditionally render the BPM button ONLY on the right deck */}
            {side === 'right' && (
                <div className="bpm-control-wrapper">
                    <CircularBpmControl />
                </div>
            )}
        </div>
    );
};

export default DeckJointList;