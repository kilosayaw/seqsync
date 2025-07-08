// src/components/ui/DeckJointList.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext'; // Re-added the missing import
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import classNames from 'classnames';
import CircularBpmControl from './CircularBpmControl';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    // Re-added the hook call to get the necessary state and setters
    const { selectedJoints, setSelectedJoints, editMode, setEditMode } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    const handleShortClick = (jointId) => {
        setSelectedJoints(prev => prev.includes(jointId) ? [] : [jointId]);
        if (jointId.endsWith('F')) {
            setEditMode(prev => (prev === side ? 'none' : side));
        } else {
            setEditMode('none');
        }
    };

    const handleLongPress = (jointId) => {
        const counterpart = jointId.startsWith('L') ? `R${jointId.substring(1)}` : `L${jointId.substring(1)}`;
        setSelectedJoints([jointId, counterpart]);
        if (jointId.endsWith('F')) {
            setEditMode('both');
        }
    };

    return (
        <div className="deck-joint-list-container">
            <div className="joint-buttons-wrapper">
                {jointsForSide.map(joint => {
                    const isSelected = selectedJoints.includes(joint.id);
                    const longPressEvents = useLongPress(() => handleShortClick(joint.id), () => handleLongPress(joint.id));
                    
                    return (
                        <button 
                            key={joint.id} 
                            className={classNames('joint-list-btn', { 'selected': isSelected })}
                            {...longPressEvents}
                        >
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