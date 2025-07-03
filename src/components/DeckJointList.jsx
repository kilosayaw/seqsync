import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useLongPress } from '../hooks/useLongPress'; // Import the new hook
import { JOINT_LIST } from '../utils/constants';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint, footEditState, toggleFootEdit } = useUIState();

    const panelJoints = JOINT_LIST.filter(j => 
        (side === 'left' && j.id.startsWith('L')) || 
        (side === 'right' && j.id.startsWith('R'))
    );

    return (
        <div className="deck-joint-list-container">
            {panelJoints.map(joint => {
                const isFootButton = joint.id.endsWith('F');
                const footSide = side; // 'left' or 'right'

                // Use the long press hook *only* for the foot buttons
                const longPressEvents = isFootButton 
                    ? useLongPress(
                        () => toggleFootEdit(footSide, 'single'), // onClick
                        () => toggleFootEdit(footSide, 'dual')   // onLongPress
                    ) : {};

                const clickHandler = !isFootButton ? () => setSelectedJoint(joint.id) : () => {};

                const isActive = (isFootButton && footEditState[footSide]) || selectedJoint === joint.id;
                
                return (
                    <button
                        key={joint.id}
                        onClick={clickHandler}
                        {...longPressEvents} // Spread the mouse handlers from the hook
                        className={`deck-joint-button ${isActive ? 'active' : ''}`}
                    >
                        {joint.name}
                    </button>
                );
            })}
        </div>
    );
};

export default DeckJointList;