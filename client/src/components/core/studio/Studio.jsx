import React, { useState } from 'react';
import styled from 'styled-components';
import { DndContext } from '@dnd-kit/core';

import TopHeader from './TopHeader';
import BeatGrid from '../main/BeatGrid';
import VisualizerDeck from './VisualizerDeck';
import FootControl from '../grounding/FootControl';
import JointSelector from './JointSelector';
import NotationDisplay from '../notation/NotationDisplay';

import { useMedia } from '../../../contexts/MediaContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';

const StudioLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #0f172a;
  overflow: hidden;
`;

const MainContent = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center; /* Center the main cockpit vertically */
    padding: 1rem;
    min-height: 0;
`;

// This is the main container for the entire interactive area
const Cockpit = styled.div`
    display: flex;
    align-items: flex-start; /* Align all direct children to the top */
    gap: 10px; /* <<< FIX: Set the 10px margin between columns >>> */
    width: 100%;
    max-width: 1200px;
`;

const CentralColumn = styled.main`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px; /* <<< FIX: Set the 10px margin between central elements >>> */
    min-width: 0;
`;

const SideColumn = styled.aside`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    /* <<< FIX: The height of the buttons + wheels will now define the panel height >>> */
`;

const Studio = () => {
    const { onSave, onLoad, songData } = useSequence();
    const { handleFileChange } = useMedia();
    const { selectedBar, selectedBeat } = useUIState();
    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);
    
    const currentBeatData = songData[selectedBar]?.[selectedBeat];
    const leftFootGround = currentBeatData?.pose?.grounding?.L;
    const rightFootGround = currentBeatData?.pose?.grounding?.R;
    
    const handleOpenPoseEditor = () => setPoseEditorOpen(true);
    const handleClosePoseEditor = () => setPoseEditorOpen(false);
    const handleBeatSelect = () => {};
    const handleDragEnd = () => {};
    return (
        <DndContext onDragEnd={handleDragEnd}>
            <StudioLayout>
                <TopHeader onSave={onSave} onLoad={onLoad} onFileSelected={handleFileChange} onOpenPoseEditor={handleOpenPoseEditor} />
                <MainContent>
                    <Cockpit>
                        <SideColumn>
                            <JointSelector side="left" />
                            <FootControl side="left" groundingState={leftFootGround} />
                        </SideColumn>

                        <CentralColumn>
                            <VisualizerDeck />
                            <NotationDisplay />
                            <BeatGrid onBeatSelect={handleBeatSelect} />
                        </CentralColumn>

                        <SideColumn>
                            <JointSelector side="right" />
                            <FootControl side="right" groundingState={rightFootGround} />
                        </SideColumn>
                    </Cockpit>
                </MainContent>
                
                {isPoseEditorOpen && <PoseEditorModal isOpen={isPoseEditorOpen} onClose={handleClosePoseEditor} />}
            </StudioLayout>
        </DndContext>
    );
};

export default Studio;