import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext'; // Correct path

const SelectorPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background-color: var(--color-background-lighter);
  border-radius: var(--border-radius-medium);
`;

const JointButton = styled.button`
  padding: 8px 12px;
  background-color: ${({ $isActive }) => $isActive ? 'var(--color-accent-yellow, #FFD700)' : 'var(--color-background-dark, #2a2a2a)'};
  color: ${({ $isActive }) => $isActive ? '#000' : 'var(--color-text-muted, #aaa)'};
  border: 1px solid var(--color-border, #444);
  border-radius: var(--border-radius-small);
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: var(--color-accent-light, #7FFFD4);
    color: ${({ $isActive }) => $isActive ? '#000' : '#fff'};
  }
`;

const JOINTS = {
  left: ['LS', 'LE', 'LW', 'LH', 'LK', 'LA', 'LF'],
  right: ['RS', 'RE', 'RW', 'RH', 'RK', 'RA', 'RF'],
};

const JointSelector = ({ side }) => {
  // Get state and setter from the context
  const { selectedJoint, setSelectedJoint } = useUIState();
  const jointsForSide = JOINTS[side] || [];

  return (
    <SelectorPanel>
      {jointsForSide.map((jointId) => (
        <JointButton
          key={jointId}
          // Set the selected joint on click
          onClick={() => setSelectedJoint(jointId)}
          // Check if this button's joint is the currently selected one
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