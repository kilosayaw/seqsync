import React from 'react';
import styled from 'styled-components';
import BeatButton from './BeatButton';
import { useUIState } from '../contexts/UIStateContext';
import { useSequence } from '../contexts/SequenceContext';

const SequencerWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 5px;
    padding: 10px;
    background-color: #2c2c2c;
    border-radius: 8px;
    width: 100%;
`;

const Sequencer = () => {
    const { selectedBar, selectedBeat, setSelectedBeat } = useUIState();
    const { getBeatData } = useSequence();

    return (
        <SequencerWrapper>
            {Array.from({ length: 16 }).map((_, index) => {
                const beatData = getBeatData(selectedBar, index);
                return (
                    <BeatButton
                        key={index}
                        beatIndex={index}
                        onClick={() => setSelectedBeat(index)}
                        isActive={selectedBeat === index}
                        thumbnail={beatData?.thumbnail}
                    />
                );
            })}
        </SequencerWrapper>
    );
};

export default Sequencer;