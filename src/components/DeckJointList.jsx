import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint } = useUIState();

    const handleJointSelect = (jointId) => {
        console.log(`[DeckJointList] Joint '${jointId}' selected on '${side}' side.`);
        setSelectedJoint(jointId);
    };

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
                    onClick={() => handleJointSelect(joint.id)}
                >
                    {joint.name}
                </button>
            ))}
        </div>
    );
};

export default DeckJointList;