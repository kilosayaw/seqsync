import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import BeatButton from '../sequencer/BeatButton'; // Correct path to BeatButton

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
    width: 100%;
`;

// --- FIX: Accept the handlers as props ---
const BeatGrid = ({ onBeatSelect, onAddSoundClick, onSoundDelete }) => {
    const { songData } = useSequence();
    const { selectedBar, isEditMode, editingBeatIndex } = useUIState();
    const { currentStep, isPlaying } = usePlayback();
    
    // Ensure we have a bar to render, even if songData is not fully loaded
    const currentBarBeats = songData.bars?.[selectedBar] || Array(16).fill({});

    return (
        <GridContainer>
            {currentBarBeats.map((beatData, index) => {
                const isCurrentStep = isPlaying && currentStep === index;
                const isSelectedForEdit = isEditMode && editingBeatIndex === index;
                const beatHasContent = beatData?.sounds?.length > 0 || (beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0);

                return (
                    <BeatButton
                        key={`${selectedBar}-${index}`}
                        beatData={{ ...beatData, beatIndex: index }}
                        onClick={() => onBeatSelect(selectedBar, index)}
                        // --- FIX: Pass the handlers down to BeatButton ---
                        onAddSoundClick={() => onAddSoundClick(selectedBar, index)}
                        onSoundDelete={(soundUrl) => onSoundDelete(selectedBar, index, soundUrl)}
                        isActive={beatHasContent}
                        isCurrentStep={isCurrentStep}
                        isSelectedForEdit={isSelectedForEdit}
                    />
                );
            })}
        </GridContainer>
    );
};

BeatGrid.propTypes = {
    onBeatSelect: PropTypes.func.isRequired,
    onAddSoundClick: PropTypes.func.isRequired,
    onSoundDelete: PropTypes.func.isRequired,
};


export default BeatGrid;