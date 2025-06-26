import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';

const SelectorPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
`;

const JointButton = styled.button`
  padding: 8px 12px;
  /* --- FIX: Apply the digital font --- */
  font-family: var(--font-digital-solid, 'Orbitron', monospace);
  font-size: 1.1rem;
  letter-spacing: 2px;
  
  background-color: ${({ $isActive }) => $isActive ? 'var(--color-accent-yellow, #FFD700)' : '#273142'};
  color: ${({ $isActive }) => $isActive ? '#0f172a' : '#94a3b8'};
  border: 1px solid #334155;
  border-radius: var(--border-radius-small);
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: var(--color-accent-light, #7FFFD4);
    color: ${({ $isActive }) => $isActive ? '#0f172a' : '#e2e8f0'};
  }
`;

const JOINTS = {
  left: ['LS', 'LE', 'LW', 'LH', 'LK', 'LA', 'LF'],
  right: ['RS', 'RE', 'RW', 'RH', 'RK', 'RA', 'RF'],
};

const JointSelector = ({ side }) => {
  const { selectedJoint, setSelectedJoint } = useUIState();
  const jointsForSide = JOINTS[side] || [];

  return (
    <SelectorPanel>
      {jointsForSide.map((jointId) => (
        <JointButton
          key={jointId}
          onClick={() => setSelectedJoint(jointId === selectedJoint ? null : jointId)} // Allow deselecting
          $isActive={selectedJoint === jointId}
        >
          {jointId}
        </JointButton>
      ))}
    </SelectorPanel>
  );
};

JointSelector.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
};

export default JointSelector;