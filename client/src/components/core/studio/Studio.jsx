import React, { useState } from 'react';
import styled from 'styled-components';
import { DndContext } from '@dnd-kit/core';

import TopHeader from './TopHeader';
import BeatGrid from '../main/BeatGrid';
import VisualizerDeck from './VisualizerDeck';
import PoseEditorModal from '../pose_editor/PoseEditorModal';

// <<< IMPORT ALL NECESSARY HOOKS >>>
import { useUIState } from '../../../contexts/UIStateContext';
import { useMedia } from '../../../contexts/MediaContext';
import { useSequence } from '../../../contexts/SequenceContext';

const StudioLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow: hidden;
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column; 
  justify-content: center;
  align-items: center;
  padding: 1rem;
  gap: 1rem; 
  overflow-y: auto;
`;

const Studio = () => {
    const { handleFileChange } = useMedia();
    const { onSave, onLoad } = useSequence(); 
    
    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);

    const handleOpenPoseEditor = () => setPoseEditorOpen(true);
    const handleClosePoseEditor = () => setPoseEditorOpen(false);
    const handleDragEnd = (event) => {};

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <StudioLayout>
                <TopHeader
                    onSave={onSave}
                    onLoad={onLoad}
                    onFileSelected={handleFileChange}
                    onOpenPoseEditor={handleOpenPoseEditor}
                />
                <MainContent>
                    <VisualizerDeck />
                    <BeatGrid />
                </MainContent>
                
                {isPoseEditorOpen && (
                    <PoseEditorModal
                        isOpen={isPoseEditorOpen}
                        onClose={handleClosePoseEditor}
                    />
                )}
            </StudioLayout>
        </DndContext>
    );
};

export default Studio;