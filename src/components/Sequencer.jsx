import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndContext } from '@dnd-kit/core';

// --- CONTEXTS & HOOKS ---
import { useSequence } from '../contexts/SequenceContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useUIState } from '../contexts/UIStateContext';
import { useMedia } from '../contexts/MediaContext';
import { useMotionAnalysisContext } from '../contexts/MotionAnalysisContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

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

// --- STYLED COMPONENTS ---
const SequencerLayoutContainer = styled.div`
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
    max-width: 1400px;
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

// --- The Main Sequencer Component ---
const Sequencer = () => {
    // --- HOOKS & CONTEXTS ---
    // FIX: Add `setPoseForBeat` and other necessary functions back to the destructuring

    const { isEditMode, isLiveCamActive, toggleLiveCam, isNudgeModeActive, setNudgeModeActive, setSelectedBeat, setEditingBeatIndex } = useUIState();
    const { livePose, startAnalysis, stopAnalysis } = useMotionAnalysisContext();
    useKeyboardControls();

    const { onSave, onLoad, loadAudioFile, triggerBeat, addSoundToBeat, setPoseForBeat, removeSoundFromBeat } = useSequence();
    const { isPlaying, isRecording, currentBar, currentStep } = usePlayback();

    // --- LOCAL UI STATE ---
    const [isNudgeEditorOpen, setNudgeEditorOpen] = useState(false);
    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);
    const [isSoundBrowserOpen, setSoundBrowserOpen] = useState(false);
    const [beatToAddTo, setBeatToAddTo] = useState(null);

    // --- REFS ---
    const sequenceFileInputRef = useRef(null);
    const audioFileInputRef = useRef(null);
    const lastRecordedStepRef = useRef(null);

    // --- LIVE RECORDING LOGIC ---
    useEffect(() => {
        if (!isPlaying || !isRecording || !livePose) return;
        if (currentStep !== lastRecordedStepRef.current) {
            // This call will now work correctly
            setPoseForBeat(currentBar, currentStep, livePose);
            lastRecordedStepRef.current = currentStep;
        }
    }, [isPlaying, isRecording, currentBar, currentStep, livePose, setPoseForBeat]);

    // --- UI HANDLERS ---
    const handleToggleLiveCamAndTracking = useCallback(() => {
        const nextIsLive = !isLiveCamActive;
        toggleLiveCam();
        if (nextIsLive) {
            startAnalysis();
        } else {
            stopAnalysis();
        }
    }, [isLiveCamActive, toggleLiveCam, startAnalysis, stopAnalysis]);
    
    const handleBeatSelect = (barIndex, beatIndex) => {
        setSelectedBeat(beatIndex);
        if (isNudgeModeActive) {
            setNudgeEditorOpen(true);
            setNudgeModeActive(false);
        } else if (isEditMode) {
            setEditingBeatIndex(beatIndex);
            setPoseEditorOpen(true);
        } else {
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
    
    // --- RENDER ---
    return (
        <DndContext onDragEnd={() => {}}>
            <SequencerLayoutContainer>
                <input type="file" ref={sequenceFileInputRef} onChange={(e) => onLoad(e.target.files[0])} style={{ display: 'none' }} accept=".json,.seqsync.json" />
                <input type="file" ref={audioFileInputRef} onChange={loadAudioFile} style={{ display: 'none' }} accept="audio/*" />

                <TopHeader
                    onSave={onSave}
                    onLoad={() => sequenceFileInputRef.current.click()}
                    onLoadAudio={() => audioFileInputRef.current.click()}
                    onOpenNudgeEditor={() => setNudgeModeActive(true)}
                    onToggleLiveCam={handleToggleLiveCamAndTracking}
                />

                <MainContent>
                    <Cockpit>
                        <SideColumn>
                            <JointSelector side="left" />
                            <FootControl side="left" />
                        </SideColumn>
                        <CentralColumn>
                            <VisualizerDeck />
                            <NotationDisplay />
                            <BeatGrid 
                                onBeatSelect={handleBeatSelect}
                                onAddSoundClick={handleAddSoundClick}
                                onSoundDelete={handleSoundDelete}
                            />
                        </CentralColumn>
                        <SideColumn>
                            <JointSelector side="right" />
                            <FootControl side="right" />
                        </SideColumn>
                    </Cockpit>
                </MainContent>

                {isPoseEditorOpen && <DetailEditor onClose={handleCloseEditor} />}
                {isNudgeEditorOpen && <MasterWaveformEditor onClose={() => setNudgeEditorOpen(false)} />}
                {isSoundBrowserOpen && <SoundBrowser onSelectSound={handleSelectSound} onClose={() => setSoundBrowserOpen(false)} />}
            </SequencerLayoutContainer>
        </DndContext>
    );
};

export default Sequencer;