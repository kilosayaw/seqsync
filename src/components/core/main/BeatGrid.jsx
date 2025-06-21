import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import BeatButton from '../sequencer/BeatButton';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { usePlayback } from '../../../contexts/PlaybackContext';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 10px;
  background-color: var(--color-background-deep, #222);
  border-radius: var(--border-radius-medium, 8px);
  width: 100%; 
  max-width: none;
`;

const BeatGrid = ({ onBeatSelect }) => {
  const { selectedBar, selectedBeat, setSelectedBeat } = useUIState();
  const { getBeatData } = useSequence();
  const { currentStep } = usePlayback();

  const handleBeatClick = (beatIndex) => {
    setSelectedBeat(beatIndex);
    // <<< FIX: This line was missing. It calls the function from Studio.jsx >>>
    if (onBeatSelect) {
      onBeatSelect(selectedBar, beatIndex);
    }
  };

  return (
    <GridContainer>
      {Array.from({ length: 16 }).map((_, index) => {
        const beatData = { 
          ...getBeatData(selectedBar, index), 
          beatIndex: index 
        };

        return (
          <BeatButton
            key={`${selectedBar}-${index}`}
            beatData={beatData}
            onClick={() => handleBeatClick(index)}
            isActive={selectedBeat === index} 
            isCurrentStep={currentStep === index}
          />
        );
      })}
    </GridContainer>
  );
};

BeatGrid.propTypes = {
    onBeatSelect: PropTypes.func.isRequired,
};

export default BeatGrid;