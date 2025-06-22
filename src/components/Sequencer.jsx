import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndContext } from '@dnd-kit/core';

// --- CONTEXTS & HOOKS ---
import { useSequence } from '../contexts/SequenceContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useUIState } from '../contexts/UIStateContext';
import { useMotionAnalysisContext } from '../contexts/MotionAnalysisContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { preloadSounds } from '../utils/audioManager';
import { tr808SoundsArray } from '../utils/soundLibrary';

// --- UI COMPONENT IMPORTS ---
import TopHeader from './core/studio/TopHeader';
import JointSelector from './core/studio/JointSelector';
import VisualizerDeck from './core/studio/VisualizerDeck';
import BeatGrid from './core/main/BeatGrid';
import FootControl from './core/grounding/FootControl';
import NotationDisplay from './core/main/NotationDisplay';
import DetailEditor from './visualizers/DetailEditor';
import MasterWaveformEditor from './core/studio/MasterWaveformEditor';
import SoundBrowser from './core/studio/SoundBrowser';

// --- NEW PROFESSIONAL LAYOUT STYLED-COMPONENTS ---
const SequencerLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #0f172a;
  overflow: hidden;
  color: #e2e8f0;
`;

const MainContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* This is key for the new layout */
    align-items: center;
    padding: 1rem 2rem;
    gap: 1rem;
    min-height: 0;
`;

const TopSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

const CenterStage = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 800px; /* Constrain the center width */
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* Align turntables to the bottom */
  gap: 1rem;
`;

const BottomCenter = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// --- The Main Sequencer Component ---
const Sequencer = () => {
    // --- All hooks, states, and handlers from previous steps are correct ---
    const { onSave, onLoad, loadAudioFile, triggerBeat, addSoundToBeat, removeSoundFromBeat, setPoseForBeat } = useSequence();
    const { selectedJoint, setSelectedJoint, isEditMode, isNudgeModeActive, setNudgeModeActive, setSelectedBeat, setEditingBeatIndex } = useUIState();
    useKeyboardControls();

    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);
    const [isSoundBrowserOpen, setSoundBrowserOpen] = useState(false);
    const [beatToAddTo, setBeatToAddTo] = useState(null);
    const sequenceFileInputRef = useRef(null);
    const audioFileInputRef = useRef(null);

    useEffect(() => { preloadSounds(tr808SoundsArray); }, []);
    
    const handleBeatSelect = (barIndex, beatIndex) => {
        setSelectedBeat(beatIndex);
        if (isEditMode) {
            setEditingBeatIndex(beatIndex);
            setPoseEditorOpen(true);
        } else if (!isNudgeModeActive) {
            triggerBeat(barIndex, beatIndex);
        }
    };

    const handleAddSoundClick = (barIndex, beatIndex) => {
        setBeatToAddTo({ bar: barIndex, beat: beatIndex });
        setSoundBrowserOpen(true);
    };

    const handleSelectSound = (soundUrl) => {
        if (beatToAddTo) {
            addSoundToBeat(beatToAddTo.bar, beatToAddTo.beat, soundUrl);
        }
    };

    const handleSoundDelete = (barIndex, beatIndex, soundUrl) => {
        removeSoundFromBeat(barIndex, beatIndex, soundUrl);
    };

    const handleCloseEditor = () => {
        setPoseEditorOpen(false);
        setEditingBeatIndex(null);
    };
    
    return (
        <DndContext onDragEnd={() => {}}>
            <SequencerLayoutContainer>
                <input type="file" ref={sequenceFileInputRef} onChange={(e) => onLoad(e.target.files[0])} style={{ display: 'none' }} accept=".json,.seqsync.json" />
                <input type="file" ref={audioFileInputRef} onChange={loadAudioFile} style={{ display: 'none' }} accept="audio/*" />

                <TopHeader
                    onSave={onSave}
                    onLoad={() => sequenceFileInputRef.current.click()}
                    onLoadAudio={() => audioFileInputRef.current.click()}
                />
                
                {/* --- THE NEW PROFESSIONAL LAYOUT --- */}
                <MainContent>
                    <TopSection>
                        <JointSelector side="left" selectedJoint={selectedJoint} onSelectJoint={setSelectedJoint} />
                        <CenterStage>
                            <VisualizerDeck />
                            <NotationDisplay />
                        </CenterStage>
                        <JointSelector side="right" selectedJoint={selectedJoint} onSelectJoint={setSelectedJoint} />
                    </TopSection>

                    <BottomSection>
                        <FootControl side="left" />
                        <BottomCenter>
                            <BeatGrid 
                                onBeatSelect={handleBeatSelect}
                                onAddSoundClick={handleAddSoundClick}
                                onSoundDelete={handleSoundDelete}
                            />
                        </BottomCenter>
                        <FootControl side="right" />
                    </BottomSection>
                </MainContent>

                {isPoseEditorOpen && <DetailEditor onClose={handleCloseEditor} />}
                {isNudgeModeActive && <MasterWaveformEditor onClose={() => setNudgeModeActive(false)} />}
                {isSoundBrowserOpen && <SoundBrowser onSelectSound={handleSelectSound} onClose={() => setSoundBrowserOpen(false)} />}
            </SequencerLayoutContainer>
        </DndContext>
    );
};

export default Sequencer;