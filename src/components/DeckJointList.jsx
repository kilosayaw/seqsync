import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { UI_LEFT_JOINTS, UI_RIGHT_JOINTS } from '../utils/constants'; // Use the new constants
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint } = useUIState();

    // Use the correct pre-filtered list based on the side prop
    const panelJoints = side === 'left' ? UI_LEFT_JOINTS : UI_RIGHT_JOINTS;

    const handleJointSelect = (jointIndex) => {
        console.log(`[DeckJointList] Joint index '${jointIndex}' selected.`);
        setSelectedJoint(jointIndex);
    };

    return (
        <div className="deck-joint-list-container">
            {panelJoints.map(joint => (
                <button
                    key={joint.index}
                    className={`deck-joint-button ${selectedJoint === joint.index ? 'active' : ''}`}
                    onClick={() => handleJointSelect(joint.index)}
                >
                    {/* Display the correct abbreviation from your spec */}
                    {joint.id}
                </button>
            ))}
        </div>
    );
};

export default DeckJointList;