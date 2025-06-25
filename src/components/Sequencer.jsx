// /client/src/components/Sequencer.jsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';

// HOOKS
import { useSequence } from '../contexts/SequenceContext.jsx';
import { useUIState, MODES } from '../contexts/UIStateContext.jsx';
import { useSequencerSettings } from '../contexts/SequencerSettingsContext.jsx';
import { useMedia } from '../contexts/MediaContext.jsx';
import { useMotionAnalysis } from '../hooks/useMotionAnalysis.js';
import { useKeyboardControls } from '../hooks/useKeyboardControls.js';
import { usePlayback } from '../contexts/PlaybackContext.jsx';
import { useDebugger } from '../contexts/DebugContext.jsx';

// UI COMPONENT IMPORTS
import TopHeader from './core/studio/TopHeader.jsx';
import JointSelector from './core/studio/JointSelector.jsx';
import VisualizerDeck from './core/studio/VisualizerDeck.jsx';
import BeatGrid from './core/main/BeatGrid.jsx';
import FootControl from './core/grounding/FootControl.jsx';
import NotationDisplay from './core/main/NotationDisplay.jsx';
import DetailEditor from './visualizers/DetailEditor.jsx';
import SoundBrowser from './core/studio/SoundBrowser.jsx';
import MasterWaveformEditor from './core/studio/MasterWaveformEditor.jsx';
import DebugPanel from './common/DebugPanel.jsx'; // --- THIS IS THE FIX ---
import { preloadSounds, unlockAudioContext } from '../utils/audioManager.js';
import { tr808SoundsArray } from '../utils/soundLibrary.js';

const Sequencer = () => {
    const { 
        songData, getBeatData, setPoseForBeat, updateSongData,
        resetSequence, onSave, onLoad, loadAudioFile, addSoundToBeat, removeSoundFromBeat, triggerBeat,
        undo, redo, canUndo, canRedo 
    } = useSequence();
    
    const { 
        currentMode, setCurrentMode, selectedBar, setSelectedBar,
        isLiveCamActive, toggleLiveCam, isFeedMirrored, toggleFeedMirror,
        isOverlayMirrored, toggleOverlayMirror, isEditMode, toggleEditMode,
        editingBeatIndex, setEditingBeatIndex, isNudgeModeActive, setNudgeModeActive,
        setSelectedBeat
    } = useUIState();

    const { 
        isPlaying, togglePlay, isRecording, toggleRecord,
        isMetronomeEnabled, toggleMetronome, tapTempo, currentStep, currentBar
    } = usePlayback();

    const { bpm, setBpm } = useSequencerSettings();
    const { videoRef } = useMedia();
    const { addLog } = useDebugger();

    const [isPoseEditorOpen, setPoseEditorOpen] = useState(false);
    const [isSoundBrowserOpen, setSoundBrowserOpen] = useState(false);
    const [beatToAddTo, setBeatToAddTo] = useState(null);

    const sequenceFileInputRef = useRef(null);
    const audioFileInputRef = useRef(null);
    
    const onAnalysisComplete = useCallback((results) => {
        addLog('Full video analysis complete. Applying poses to grid.', 'MotionAnalysis');
        updateSongData(currentData => {
            const newBars = JSON.parse(JSON.stringify(currentData.bars));
            results.forEach(res => {
                const { bar, beat, poseData, thumbnail } = res;
                if (newBars[bar]?.[beat]) {
                    newBars[bar][beat].pose = poseData;
                    if(thumbnail) newBars[bar][beat].thumbnail = thumbnail;
                }
            });
            return { ...currentData, bars: newBars };
        }, true);
    }, [updateSongData, addLog]);
    
    // --- THIS IS THE OTHER FIX ---
    const { startFullAnalysis, isAnalyzing, livePoseData, onPoseUpdate } = useMotionAnalysis({ 
        onPoseUpdate: (pose) => {
            if (isRecording && isPlaying) {
                setPoseForBeat(currentBar, currentStep, pose);
            }
        },
        onAnalysisComplete,
        isOverlayMirrored
    });

    const handleAnalyzeVideo = () => {
        if (videoRef.current && (videoRef.current.src || videoRef.current.srcObject)) {
            addLog('Starting full video analysis.', 'UI');
            const totalBars = Object.keys(songData.bars).length;
            startFullAnalysis(videoRef.current, bpm, totalBars);
        } else {
            toast.error("Please load a video or enable the live camera first.");
        }
    };

    const handleNewProject = () => {
        if (window.confirm("This will clear the current project and cannot be undone. Are you sure?")) {
            addLog('New project started.', 'System');
            resetSequence();
        }
    };

    useKeyboardControls();
    
    const activeBeatData = getBeatData(selectedBar, editingBeatIndex);

    const handleFootControlChange = useCallback((side, newValues) => {
        const beatIndexToUpdate = editingBeatIndex ?? 0;
        const barToUpdate = selectedBar;
        setPoseForBeat(barToUpdate, beatIndexToUpdate, { grounding: newValues });
    }, [editingBeatIndex, selectedBar, setPoseForBeat]);

    const handleGroundingChange = (side, notation) => handleFootControlChange(side, { [side]: notation });
    const handleFootRotationChange = (side, rotation) => handleFootControlChange(side, { [`${side}_rotation`]: rotation });
    const handleAnkleRotationChange = (side, rotation) => handleFootControlChange(side, { [`${side}_ankle_rotation`]: rotation });

    const handleBeatSelect = (barIndex, beatIndex) => {
        unlockAudioContext();
        setSelectedBeat(beatIndex);
        if (isEditMode) {
            addLog(`Entering edit mode for B:${barIndex+1} S:${beatIndex+1}`, 'UI');
            setEditingBeatIndex(beatIndex);
            setPoseEditorOpen(true);
        } else {
            addLog(`Triggering beat B:${barIndex+1} S:${beatIndex+1}`, 'UI');
            triggerBeat(barIndex, beatIndex, videoRef.current);
        }
    };
    
    const handleCloseEditor = () => {
        setEditingBeatIndex(null);
        setPoseEditorOpen(false);
    };

    useEffect(() => { preloadSounds(tr808SoundsArray); }, []);

    return (
        <DndContext onDragEnd={() => {}}>
            <div className="flex flex-col h-screen w-screen bg-slate-900 overflow-hidden select-none">
                <input type="file" ref={sequenceFileInputRef} onChange={(e) => onLoad(e.target.files[0])} style={{ display: 'none' }} accept=".json,.seqsync.json" />
                <input type="file" ref={audioFileInputRef} onChange={loadAudioFile} style={{ display: 'none' }} accept="audio/*,video/*" />
                
                <TopHeader 
                    onNew={handleNewProject}
                    onSave={onSave} 
                    onLoad={() => sequenceFileInputRef.current.click()} 
                    onLoadAudio={() => audioFileInputRef.current.click()} 
                    onAnalyzeVideo={handleAnalyzeVideo}
                    isAnalyzing={isAnalyzing}
                    selectedBar={selectedBar}
                    totalBars={Object.keys(songData.bars).length || 1}
                    onBarChange={setSelectedBar}
                    bpm={bpm}
                    onBpmChange={setBpm}
                    onTapTempo={tapTempo}
                    currentMode={currentMode}
                    onModeChange={setCurrentMode}
                    isLiveCamActive={isLiveCamActive}
                    onToggleLiveCam={toggleLiveCam}
                    isFeedMirrored={isFeedMirrored}
                    onToggleFeedMirror={toggleFeedMirror}
                    isOverlayMirrored={isOverlayMirrored}
                    onToggleOverlayMirror={toggleOverlayMirror}
                    isRecording={isRecording}
                    onToggleRecord={toggleRecord}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    isMetronomeEnabled={isMetronomeEnabled}
                    onToggleMetronome={toggleMetronome}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    isEditMode={isEditMode}
                    onToggleEditMode={toggleEditMode}
                    isNudgeModeActive={isNudgeModeActive}
                    onToggleNudgeMode={() => setNudgeModeActive(prev => !prev)}
                />
                
                <main className="flex-grow flex justify-center items-center p-4 min-h-0">
                   <div className="flex items-start gap-4 w-full max-w-[1400px]">
                        <aside className="flex-shrink-0 flex flex-col items-center gap-4">
                            <JointSelector side="left" />
                            <FootControl side="L" groundPoints={activeBeatData?.pose?.grounding?.L} rotation={activeBeatData?.pose?.grounding?.L_rotation || 0} ankleRotation={activeBeatData?.pose?.grounding?.L_ankle_rotation || 0} onGroundingChange={handleGroundingChange} onRotate={handleFootRotationChange} onAnkleRotationChange={handleAnkleRotationChange}/>
                        </aside>
                        <section className="flex-grow flex flex-col items-center gap-4 min-w-0">
                            <VisualizerDeck 
                                poseData={isLiveCamActive ? livePoseData : activeBeatData?.pose} 
                            />
                            <NotationDisplay />
                            <BeatGrid 
                                onBeatSelect={handleBeatSelect} 
                                onAddSoundClick={(bar, beat) => { setBeatToAddTo({bar, beat}); setSoundBrowserOpen(true); }} 
                                onSoundDelete={(bar, beat, url) => removeSoundFromBeat(bar, beat, url)} 
                            />
                        </section>
                        <aside className="flex-shrink-0 flex flex-col items-center gap-4">
                            <JointSelector side="right" />
                            <FootControl side="R" groundPoints={activeBeatData?.pose?.grounding?.R} rotation={activeBeatData?.pose?.grounding?.R_rotation || 0} ankleRotation={activeBeatData?.pose?.grounding?.R_ankle_rotation || 0} onGroundingChange={handleGroundingChange} onRotate={handleFootRotationChange} onAnkleRotationChange={handleAnkleRotationChange}/>
                        </aside>
                   </div>
                </main>
                {isEditMode && editingBeatIndex !== null && <DetailEditor onClose={handleCloseEditor} />}
                {isSoundBrowserOpen && <SoundBrowser onSelectSound={(url) => { if(beatToAddTo) addSoundToBeat(beatToAddTo.bar, beatToAddTo.beat, url); }} onClose={() => setSoundBrowserOpen(false)} />}
                {isNudgeModeActive && <MasterWaveformEditor onClose={() => setNudgeModeActive(false)} />}
                {process.env.NODE_ENV === 'development' && <DebugPanel />}
            </div>
        </DndContext>
    );
};

export default Sequencer;