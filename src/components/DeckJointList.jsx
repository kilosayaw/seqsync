import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint } = useUIState();

    const panelJoints = JOINT_LIST.filter(j => 
        (side === 'left' && j.id.startsWith('L')) || 
        (side === 'right' && j.id.startsWith('R'))
    );

    return (
        <div className="deck-joint-list-container">
            {panelJoints.map(joint => (
                <button
                    key={joint.id}
                    className={`deck-joint-button ${selectedJoint === joint.id ? 'active' : ''}`}
                    onClick={() => setSelectedJoint(joint.id)}
                >
                    {/* KEY CHANGE: Using the short ID to fit the square button style */}
                    {joint.id}
                </button>
            ))}
        </div>
    );
};

export default DeckJointList;