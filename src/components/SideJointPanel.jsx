import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import './SideJointPanel.css';

const SideJointPanel = ({ side }) => {
  const { appMode, selectedJoint, setSelectedJoint, selectedBeat } = useUIState();

  const isPanelDisabled = appMode !== 'POS' || selectedBeat === null;

  const handleJointSelect = (jointId) => {
    if (!isPanelDisabled) {
      setSelectedJoint(jointId);
    }
  };

  const panelJoints = side === 'left' 
    ? JOINT_LIST.filter(j => j.id.startsWith('L') || ['H', 'N', 'TC'].includes(j.id))
    : JOINT_LIST.filter(j => j.id.startsWith('R'));

  return (
    <div className={`side-joint-panel ${isPanelDisabled ? 'disabled' : ''}`}>
      <h3 className="panel-title">{side} Side Controls</h3>
      <div className="joints-container">
        {panelJoints.map(joint => (
          <button
            key={joint.id}
            className={`joint-button ${selectedJoint === joint.id ? 'selected' : ''}`}
            onClick={() => handleJointSelect(joint.id)}
            disabled={isPanelDisabled}
          >
            <span className="joint-id">{joint.id}</span>
            <span className="joint-name">{joint.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideJointPanel;