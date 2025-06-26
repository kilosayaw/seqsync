import React from 'react';
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
  max-width: 800px;
  box-sizing: border-box;
`;

const BeatGrid = () => {
  const { selectedBar, selectedBeat, setSelectedBeat } = useUIState();
  const { getBeatData } = useSequence();
  const { currentStep } = usePlayback(); // Get the live playhead position

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
            onClick={() => setSelectedBeat(index)}
            isActive={selectedBeat === index} 
            isCurrentStep={currentStep === index} // Pass the playhead status
          />
        );
      })}
    </GridContainer>
  );
};

export default BeatGrid;