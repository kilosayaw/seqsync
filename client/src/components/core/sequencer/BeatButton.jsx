import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const PoseIndicator = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent, #00FFFF); /* Fallback color */
  opacity: ${({ $hasPose }) => ($hasPose ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
`;

const BeatNumber = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-muted, #999);
  font-size: 1.5em;
  font-weight: bold;
  visibility: ${({ $hasThumbnail }) => $hasThumbnail ? 'hidden' : 'visible'};
  pointer-events: none;
`;

// This is the fully upgraded styled-component with the playhead logic
const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-small, 4px);
  
  /* 
    This logic prioritizes the playhead highlight.
    If it's the current step, it's bright cyan.
    If not, but it's the selected beat, it's a dimmer accent color.
    Otherwise, it's the default border.
  */
  border: 2px solid ${({ $isActive, $isCurrentStep }) => 
    ($isCurrentStep ? 'var(--color-highlight-strong, #00FFFF)' : 
    ($isActive ? 'var(--color-accent, #00AACC)' : 'var(--color-border, #444)'))};
  
  /* Add a glow effect to the playhead for more emphasis */
  box-shadow: ${({ $isCurrentStep }) => $isCurrentStep ? '0 0 8px 2px var(--color-highlight-strong, #00FFFF)' : 'none'};
  
  background-image: ${({ $thumbnail }) => $thumbnail ? `url(${$thumbnail})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  background-color: var(--color-background-lighter, #333);
  transition: all 0.1s ease-in-out; /* Faster transition for responsive feel */
  cursor: pointer;

  &:hover {
    border-color: var(--color-accent-light, #7FFFD4);
  }
`;

const BeatButton = ({
  beatData,
  onClick,
  isActive,
  isCurrentStep,
}) => {
  
  const thumbnail = beatData?.thumbnail || null;
  const hasPose = beatData?.pose?.N?.visibility > 0;

  return (
    <ButtonWrapper
      onClick={onClick}
      $isActive={isActive}
      $isCurrentStep={isCurrentStep}
      $thumbnail={thumbnail}
      role="button"
      aria-label={`Beat ${beatData.beatIndex + 1}`}
    >
      <BeatNumber $hasThumbnail={!!thumbnail}>{beatData.beatIndex + 1}</BeatNumber>
      <PoseIndicator $hasPose={hasPose} />
    </ButtonWrapper>
  );
};

BeatButton.propTypes = {
  beatData: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
};

// Memoization helps prevent unnecessary re-renders of all 16 buttons on every step.
export default React.memo(BeatButton);