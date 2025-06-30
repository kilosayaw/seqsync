import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
  const { selectedJoint, setSelectedJoint } = useUIState();

  // The center joints (H, N, TC) will be handled by the center console.
  // This list only shows side-specific joints.
  const panelJoints = JOINT_LIST.filter(j => j.id.startsWith(side === 'left' ? 'L' : 'R'));

  return (
    <div className="deck-joint-list-container">
      {panelJoints.map(joint => (
        <button
          key={joint.id}
          className={`deck-joint-button ${selectedJoint === joint.id ? 'active' : ''}`}
          onClick={() => setSelectedJoint(joint.id)}
        >
          {joint.id}
        </button>
      ))}
    </div>
  );
};

export default DeckJointList;