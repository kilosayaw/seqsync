import React, { useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';
import TopHeader from './TopHeader';
import PlaybackControls from '../transport/PlaybackControls';
import BeatGrid from './BeatGrid';
import NotationDisplay from './NotationDisplay';
import VisualizerDeck from './VisualizerDeck';
import SideJointSelector from '../pose_editor/SideJointSelector';
import { JointInputPanel } from '../pose_editor/JointInputPanel';
import PoseEditorModal from '../pose_editor/PoseEditorModal.jsx';
import IntentPalette from '../pose_editor/IntentPalette.jsx';
import { SequenceProvider } from '../../../contexts/SequenceContext.jsx';
import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx';
import { UIStateProvider } from '../../../contexts/UIStateContext.jsx';
import { MediaProvider } from '../../../contexts/MediaContext.jsx';
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import { useMedia } from '../../../contexts/MediaContext.jsx';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls.js';
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';

// --- PROVIDER WRAPPER ---
// To keep StudioLayout clean, we wrap it in the final export
const Studio = () => (
    <UIStateProvider>
        <PlaybackProvider>
            <MediaProvider>
                <SequenceProvider>
                    <StudioLayout />
                </SequenceProvider>
            </MediaProvider>
        </PlaybackProvider>
    </UIStateProvider>
);

// --- MAIN LAYOUT COMPONENT ---
const StudioLayout = () => {
    // 1. Consume ALL contexts to get state AND setters
    const { songData, updateSongData, handleUndo, handleRedo, history, historyIndex, addBar, removeBar, clearBar, copyBar, pasteBar, copiedBarData, copyPose, pastePose, copiedPoseData, handleSaveSequence, handleLoadSequence } = useSequence();
    const { isPlaying, isRecording, bpm, setBpm, timeSignature, setTimeSignature, handlePlayPause, handleStop, handleTapTempo, handleRecord, handleSkip, handleSkipIntervalChange, currentBar, currentStep } = usePlayback();
    const { activeEditingJoint, setActiveEditingJoint, currentEditingBar, activeBeatIndex, handleNavigateEditingBar, isPoseEditorOpen, closePoseEditor } = useUIState();
    const { setMediaFile, setMediaStream, mediaStream, videoPlayerRef } = useMedia();
    
    // Initialize global keyboard hotkeys
    useKeyboardControls();

    // 2. FULLY IMPLEMENT useMotionAnalysis Hook
    // Define the callback for when the full analysis process completes
    const onAnalysisComplete = useCallback((results) => {
        updateSongData(currentData => {
            results.forEach(res => {
                const { bar, beat, poseData, thumbnail } = res;
                if (currentData[bar] && currentData[bar].beats[beat]) {
                    const targetBeat = currentData[bar].beats[beat];
                    targetBeat.jointInfo = poseData.jointInfo;
                    targetBeat.grounding = poseData.grounding;
                    // Note: Full analysis does not generate thumbnails yet, this is a placeholder
                    if (thumbnail) targetBeat.thumbnail = thumbnail;
                }
            });
            return currentData;
        }, 'Apply Full Analysis');
        toast.success("Motion analysis complete. Poses applied to sequence.");
    }, [updateSongData]);

    const { startFullAnalysis /*...other motion analysis fns...*/ } = useMotionAnalysis({
        onAnalysisComplete: useCallback((results) => {
            updateSongData(currentData => {
                results.forEach(res => {
                    const { bar, beat, poseData } = res;
                    if (currentData[bar] && currentData[bar].beats[beat]) {
                        currentData[bar].beats[beat].jointInfo = poseData.jointInfo;
                        currentData[bar].beats[beat].grounding = poseData.grounding;
                    }
                });
                return currentData;
            }, 'Apply Full Analysis');
            toast.success("Motion analysis complete.");
        }, [updateSongData])
    });

    // Initialize the hook and destructure all its returned values
    const {
        isInitializing,
        isTracking,
        isAnalyzing,
        analysisProgress,
        livePoseData,
        startLiveTracking,
        stopLiveTracking,
        cancelFullAnalysis
    } = useMotionAnalysis({ onAnalysisComplete });

    const saveSequenceHandler = useCallback(() => {
        handleSaveSequence(selectedKitName);
    }, [handleSaveSequence, selectedKitName]);

    const loadSequenceHandler = useCallback((file) => {
        handleLoadSequence(file, setSelectedKitName);
    }, [handleLoadSequence, setSelectedKitName]);

    // 3. Define Handlers that use the Motion Analysis Hook
    const handleStartAnalysis = useCallback(() => {
        if (!videoPlayerRef.current) {
            toast.error("Video player element not found. Please load media first.");
            return;
        }
        startFullAnalysis(videoPlayerRef.current, bpm, timeSignature, songData.length, UI_PADS_PER_BAR);
    }, [startFullAnalysis, videoPlayerRef, bpm, timeSignature, songData.length]);

    const handleActivateCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setMediaStream(stream);
            toast.success("Live camera activated!");
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera. Please check permissions.");
        }
    }, [setMediaStream]);
    
    // 4. Implement useEffect for Live Tracking & Recording
    // This effect starts/stops live pose tracking when the camera is turned on/off.
    useEffect(() => {
        if (mediaStream && videoPlayerRef.current) {
            startLiveTracking(videoPlayerRef.current);
        }
        // Cleanup function: stop tracking when the stream is disconnected or component unmounts
        return () => {
            stopLiveTracking();
        };
    }, [mediaStream, videoPlayerRef, startLiveTracking, stopLiveTracking]);

    // This effect handles the core "Live Recording" logic.
    useEffect(() => {
        // Guard clause: Only run if all conditions for recording are met.
        if (!isPlaying || !isRecording || !livePoseData) return;
        
        // This effect runs every time the current beat changes.
        // It writes the currently detected pose from the camera to that beat's data.
        updateSongData(d => {
            const beatToUpdate = d[currentBar]?.beats[currentStep];
            if (beatToUpdate) {
                beatToUpdate.jointInfo = livePoseData.jointInfo;
                beatToUpdate.grounding = livePoseData.grounding;
            }
            return d;
        }, `Record Pose B${currentBar + 1}:S${currentStep + 1}`);
        
    }, [currentBar, currentStep, isPlaying, isRecording, livePoseData, updateSongData]);


    // 5. Define other UI Handlers
    const handleJointDataUpdate = useCallback((jointAbbrev, newJointData) => {
        updateSongData(d => {
            const beat = d[currentEditingBar]?.beats[activeBeatIndex];
            if (beat) {
                if (!beat.jointInfo) beat.jointInfo = {};
                beat.jointInfo[jointAbbrev] = { ...beat.jointInfo[jointAbbrev], ...newJointData };
            }
            return d;
        }, `Update ${jointAbbrev} Data`);
    }, [currentEditingBar, activeBeatIndex, updateSongData]);

    const handleIntentSelect = useCallback((intentValue) => {
        if (!activeEditingJoint) {
            toast.info("Select a joint before assigning an intent.");
            return;
        }
        handleJointDataUpdate(activeEditingJoint, { intent: intentValue });
        toast.success(`Intent '${intentValue}' set for ${activeEditingJoint}`);
    }, [activeEditingJoint, handleJointDataUpdate]);

    // 6. Render the Final Layout with all props wired up
   return (
        <DndContext>
            <div className="p-2 sm:p-3 bg-dark-bg text-text-primary h-screen flex flex-col font-sans select-none">
                <div className="w-full max-w-full 2xl:max-w-screen-3xl mx-auto flex flex-col h-full overflow-hidden">
                    <TopHeader 
                        onSave={saveSequenceHandler}
                        onLoad={loadSequenceHandler}
                        onFileSelected={setMediaFile}
                        onActivateCamera={handleActivateCamera}
                        onAnalyze={handleStartAnalysis}
                        // Pass down analysis state for the button UI
                    />
                    
                    <PlaybackControls
                        onUndo={handleUndo} onRedo={handleRedo} canUndo={historyIndex > 0} canRedo={history.length > 1 && historyIndex < history.length - 1}
                        isPlaying={isPlaying} onPlayPause={handlePlayPause}
                        isRecording={isRecording} onRecord={handleRecord}
                        onStop={handleStop} onTapTempo={handleTapTempo}
                        onAddBar={addBar} onRemoveBar={removeBar} onClearBar={() => clearBar(currentEditingBar)}
                        onNextBar={() => handleNavigateEditingBar(1)} onPrevBar={() => handleNavigateEditingBar(-1)}
                        onCopyBar={() => copyBar(currentEditingBar)} onPasteBar={() => pasteBar(currentEditingBar)} canPaste={!!copiedBarData}
                        onCopyPose={() => copyPose(currentEditingBar, activeBeatIndex)} onPastePose={() => pastePose(currentEditingBar, activeBeatIndex)} canPastePose={!!copiedPoseData}
                        onSkipForward={() => handleSkip(1)} onSkipBackward={() => handleSkip(-1)} onSkipIntervalChange={handleSkipIntervalChange}
                        bpm={bpm} timeSignature={timeSignature} onBpmChange={(e) => setBpm(parseInt(e.target.value) || DEFAULT_BPM)} onTimeSignatureChange={setTimeSignature}
                    />

                    <main className="flex-grow grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-3 overflow-hidden min-h-0">
                        <aside className="order-1 flex flex-col items-center gap-2 p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg">
                            <SideJointSelector side="L" onJointSelect={setActiveEditingJoint} activeEditingJoint={activeEditingJoint} />
                            {activeEditingJoint && UI_LEFT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && 
                                <JointInputPanel jointAbbrev={activeEditingJoint} onUpdate={handleJointDataUpdate} onClose={() => setActiveEditingJoint(null)} />}
                            <IntentPalette onIntentSelect={handleIntentSelect} />
                        </aside>

                        <div className="order-2 flex flex-col items-center justify-start gap-2 overflow-hidden">
                            <BeatGrid />
                            <NotationDisplay />
                            <VisualizerDeck />
                        </div>
                        
                        <aside className="order-3 flex flex-col items-center gap-2 p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg">
                           <SideJointSelector side="R" onJointSelect={setActiveEditingJoint} activeEditingJoint={activeEditingJoint} />
                           {activeEditingJoint && UI_RIGHT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && 
                                <JointInputPanel jointAbbrev={activeEditingJoint} onUpdate={handleJointDataUpdate} onClose={() => setActiveEditingJoint(null)} />}
                        </aside>
                    </main>
                </div>
            </div>
            <PoseEditorModal 
                isOpen={isPoseEditorOpen} onClose={closePoseEditor}
                barIndex={currentEditingBar} beatIndex={activeBeatIndex}
            />
        </DndContext>
    );
};

// NOTE: The provider components must be imported in the final `Studio` component for this to work.
// This example assumes they are correctly imported.
// e.g., import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx'; etc.

export default Studio;