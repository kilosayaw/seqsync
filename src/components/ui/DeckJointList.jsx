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
                    const isSelected = isFootButton && (editMode === side || editMode === 'both');

                    const handleShortClick = () => {
                        const newMode = editMode === side ? 'none' : side;
                        console.log(`[Joints] Foot short-clicked. Setting editMode to: ${newMode}`);
                        setEditMode(newMode);
                    };
                    
                    const handleLongPress = () => {
                        console.log('[Joints] Foot long-pressed. Setting editMode to: both');
                        setEditMode('both');
                    };

                    const handleRegularClick = () => {
                        console.log(`[Joints] Regular joint ${joint.id} clicked.`);
                        // Future logic for selecting non-foot joints would go here
                    };

                    const longPressEvents = isFootButton ? useLongPress(handleShortClick, handleLongPress) : {};
                    const regularClickEvent = !isFootButton ? { onClick: handleRegularClick } : {};
                    
                    return (
                        <button key={joint.id} className={`joint-list-btn ${isSelected ? 'selected' : ''}`}
                            {...longPressEvents}
                            {...regularClickEvent} >
                            {joint.id}
                        </button>
                    );
                })}
            </div>
            {side === 'right' && (
                <div className="bpm-control-wrapper">
                    <CircularBpmControl />
                </div>
            )}
        </div>
    );
};
export default DeckJointList;