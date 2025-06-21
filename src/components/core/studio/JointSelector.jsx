import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';

// The container now uses flexbox to distribute space
const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Evenly space the buttons */
  width: 100px;
  /* <<< FIX: The container's height matches the visualizer >>> */
  height: 360px; /* Matches the 16:9 aspect ratio of 640px width */
  padding: 1rem;
  background-color: #18181b;
  border-radius: 8px;
`;

const JointButton = styled.button`
    width: 100%;
    /* <<< FIX: Padding and font size adjusted for a smaller button >>> */
    padding: 0.5rem 0;
    font-size: 0.9rem;
    font-family: 'Orbitron', sans-serif;
    color: ${({ $isActive }) => $isActive ? '#000' : 'var(--color-text-muted)'};
    background-color: ${({ $isActive }) => $isActive ? 'var(--color-accent)' : '#333'};
    border: 1px solid #444;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--color-accent);
        color: var(--color-text);
    }
`;

const JointSelector = ({ side }) => {
    const { selectedJoint, setSelectedJoint } = useUIState();

    const joints = side === 'left' 
        ? ['LS', 'LE', 'LW', 'LH', 'LK', 'LA', 'LF']
        : ['RS', 'RE', 'RW', 'RH', 'RK', 'RA', 'RF'];
    
    return (
        <SelectorContainer>
            {joints.map(jointAbbrev => (
                <JointButton 
                    key={jointAbbrev}
                    onClick={() => setSelectedJoint(jointAbbrev)}
                    $isActive={selectedJoint === jointAbbrev}
                >
                    {jointAbbrev}
                </JointButton>
            ))}
        </SelectorContainer>
    );
};

JointSelector.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
};

export default JointSelector;