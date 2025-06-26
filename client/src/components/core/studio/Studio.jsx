import React, { useState, useRef } from 'react'; // <-- IMPORT useRef
import styled from 'styled-components';
import { DndContext } from '@dnd-kit/core';

// Corrected import paths based on your final structure
import TopHeader from './TopHeader';
import JointSelector from './JointSelector';
import VisualizerDeck from './VisualizerDeck';
import BeatGrid from '../main/BeatGrid'; 
import FootControl from '../grounding/FootControl'; 
import NotationDisplay from '../main/NotationDisplay'; 
import DetailEditor from '../../visualizers/DetailEditor'; 
import MasterWaveformEditor from './MasterWaveformEditor';

import { useMedia } from '../../../contexts/MediaContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';

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
    align-items: center;
    padding: 1rem;
    min-height: 0;
`;

const Cockpit = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    max-width: 1200px;
`;

const CentralColumn = styled.main`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    min-width: 0;
`;

const SideColumn = styled.aside`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`;

const Studio = () => {
    const { onSave, onLoad, songData, loadAudioFile } = useSequence();
    const { handleFileChange } = useMedia(); // This might be redundant now, but safe to keep
    const { selectedBar, selectedBeat, isEditMode, setEditingBeatIndex, setSelectedBeat } = useUIState();
    const { playAudioSlice } = usePlayback();

    const [isNudgeEditorOpen, setNudgeEditorOpen] = useState(false);
    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);
    
    // Refs are now correctly imported and used
    const sequenceFileInputRef = useRef(null);
    const audioFileInputRef = useRef(null);
    
    const handleBeatSelect = (barIndex, beatIndex) => {
        if (isEditMode) {
            setEditingBeatIndex(beatIndex);
            setSelectedBeat(beatIndex);
            setPoseEditorOpen(true); // Open the Pose Editor when a beat is clicked in Edit Mode
        } else {
            playAudioSlice(barIndex, beatIndex);
            setSelectedBeat(beatIndex);
        }
    };

    const handleSequenceFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            onLoad(file);
        }
    };

    const handleAudioFileSelect = (event) => {
        loadAudioFile(event);
    };

    const handleCloseEditor = () => {
        setPoseEditorOpen(false);
        setEditingBeatIndex(null); 
    };

    return (
        <DndContext onDragEnd={() => {}}>
            <StudioLayout>
                {/* Hidden file inputs */}
                <input type="file" ref={sequenceFileInputRef} onChange={handleSequenceFileSelect} style={{ display: 'none' }} accept=".json,.seqsync" />
                <input type="file" ref={audioFileInputRef} onChange={handleAudioFileSelect} style={{ display: 'none' }} accept="audio/*" />

                <TopHeader 
                    onSave={onSave} 
                    onLoad={() => sequenceFileInputRef.current.click()}
                    onLoadAudio={() => audioFileInputRef.current.click()}
                    onOpenNudgeEditor={() => setNudgeEditorOpen(true)}
                />
                
                {/* --- MainContent was missing from the return block --- */}
                <MainContent>
                    <Cockpit>
                        <SideColumn>
                            <JointSelector side="left" />
                            <FootControl side="left" />
                        </SideColumn>

                        <CentralColumn>
                            <VisualizerDeck />
                            <NotationDisplay />
                            <BeatGrid onBeatSelect={handleBeatSelect} />
                        </CentralColumn>

                        <SideColumn>
                            <JointSelector side="right" />
                            <FootControl side="right" />
                        </SideColumn>
                    </Cockpit>
                </MainContent>

                {isPoseEditorOpen && <DetailEditor onClose={handleCloseEditor} />}
                {isNudgeEditorOpen && <MasterWaveformEditor onClose={() => setNudgeEditorOpen(false)} />}
            </StudioLayout>
        </DndContext>
    );
};

export default Studio;