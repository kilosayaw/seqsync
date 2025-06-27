import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../../../constants/dragTypes'; 

// Main button container
const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-small);
  border: 2px solid ${({ isActive, isCurrentStep }) => 
    (isActive ? 'var(--color-accent)' : 
    (isCurrentStep ? 'var(--color-highlight)' : 'var(--color-border)'))};
  
  // <<< FIX: Logic to display the thumbnail >>>
  background-image: ${({ thumbnail }) => thumbnail ? `url(${thumbnail})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  background-color: var(--color-background-lighter);
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: var(--color-accent-light);
  }
`;

// Beat number visible only when no thumbnail
const BeatNumber = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-muted);
  font-size: 1.5em;
  font-weight: bold;
  visibility: ${({ hasThumbnail }) => hasThumbnail ? 'hidden' : 'visible'};
  pointer-events: none;
`;


const BeatButton = ({
  barIndex,
  beatIndex,
  beatData,
  onClick,
  isCurrentStep,
  isRecording,
  viewMode,
  onAddSound,
  onDeleteSound,
  onClearPoseData,
}) => {
  const isActive = beatIndex === beatData.beatIndex;
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.SOUND],
    drop: (item) => onAddSound(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  
  // Ensure beatData and its properties exist before trying to access them
  const thumbnail = beatData?.thumbnail || null;
  const hasPose = beatData?.pose?.N?.visibility > 0;

  return (
    <ButtonWrapper
      ref={drop}
      onClick={onClick}
      isActive={isActive}
      isCurrentStep={isCurrentStep}
      thumbnail={thumbnail}
      role="button"
      aria-label={`Beat ${beatIndex + 1}`}
    >
      <BeatNumber hasThumbnail={!!thumbnail}>{beatIndex + 1}</BeatNumber>
    </ButtonWrapper>
  );
};

BeatButton.propTypes = {
  barIndex: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
  beatData: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  viewMode: PropTypes.string.isRequired,
  onAddSound: PropTypes.func.isRequired,
  onDeleteSound: PropTypes.func.isRequired,
  onClearPoseData: PropTypes.func.isRequired,
};

export default BeatButton;