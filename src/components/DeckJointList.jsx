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

    const isFootSelected = selectedJoint === 'LF' || selectedJoint === 'RF';

    return (
        <div className="deck-joint-list-container">
            {panelJoints.map(joint => {
                const isCurrentJointSelected = selectedJoint === joint.id;
                // A foot button is "active" if it's selected.
                // Other buttons are "highlighted" if a foot is selected.
                const buttonClass = (joint.id.endsWith('F') && isCurrentJointSelected)
                    ? 'active'
                    : (!joint.id.endsWith('F') && isFootSelected)
                        ? 'highlight'
                        : '';

                return (
                    <button
                        key={joint.id}
                        onClick={() => setSelectedJoint(joint.id)}
                        className={`deck-joint-button ${buttonClass}`}
                    >
                        {joint.name}
                    </button>
                );
            })}
        </div>
    );
};

export default DeckJointList;