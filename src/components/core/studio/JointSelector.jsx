import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// NOTE: This component no longer needs useUIState, it receives state as props.
// This makes it more reusable.

const SelectorPanel = styled.div`/* ... */`;
const JointButton = styled.button`/* ... */`;

const JOINTS = {
  left: ['LS', 'LE', 'LW', 'LH', 'LK', 'LA', 'LF'],
  right: ['RS', 'RE', 'RW', 'RH', 'RK', 'RA', 'RF'],
};

// --- FIX: Component now accepts props for state and callbacks ---
const JointSelector = ({ side, selectedJoint, onSelectJoint }) => {
  const jointsForSide = JOINTS[side] || [];

  return (
    <SelectorPanel>
      {jointsForSide.map((jointId) => (
        <JointButton
          key={jointId}
          // Call the passed-in handler on click
          onClick={() => onSelectJoint(jointId)}
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
  selectedJoint: PropTypes.string, // The currently active joint
  onSelectJoint: PropTypes.func.isRequired, // The function to call when a button is clicked
};

export default JointSelector;