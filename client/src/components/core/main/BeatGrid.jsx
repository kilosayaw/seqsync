// /client/src/components/core/main/BeatGrid.jsx
import React from 'react';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import BeatButton from '../sequencer/BeatButton.jsx';

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    width: 100%;
    padding: 8px;
    background-color: #1e293b;
    border-radius: 8px;
`;

// The rest of the component logic remains the same.
const BeatGrid = ({ onBeatSelect, onAddSoundClick, onSoundDelete }) => {
    const { songData } = useSequence();
    const { selectedBar, isEditMode, editingBeatIndex } = useUIState();
    // --- FIX: Get the currently PLAYING bar and step from the playback context ---
    const { currentStep, currentBar, isPlaying } = usePlayback();
    
    // Use the bar that is currently selected in the UI for rendering the grid
    const barToRender = songData.bars?.[selectedBar] || Array(16).fill({}).map((_, i) => ({ beatIndex: i }));

    return (
        <GridContainer>
            {barToRender.map((beatData, index) => {
                // --- FIX: Highlighting logic ---
                // Light up if playback is running AND the playing bar is the one we are looking at AND the step matches.
                const isCurrentPlaybackStep = isPlaying && currentBar === selectedBar && currentStep === index;
                
                const isSelectedForEditing = isEditMode && editingBeatIndex === index;
                const beatHasContent = beatData?.sounds?.length > 0 || (beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0);

                return (
                    <BeatButton
                        key={`${selectedBar}-${index}`}
                        beatData={{ ...beatData, beatIndex: index }}
                        onClick={() => onBeatSelect(selectedBar, index)}
                        onAddSoundClick={() => onAddSoundClick(selectedBar, index)}
                        onSoundDelete={(soundUrl) => onSoundDelete(selectedBar, index, soundUrl)}
                        isActive={beatHasContent}
                        isCurrentStep={isCurrentPlaybackStep} // Use the corrected value
                        isSelectedForEdit={isSelectedForEditing}
                    />
                );
            })}
        </GridContainer>
    );
};

export default BeatGrid;