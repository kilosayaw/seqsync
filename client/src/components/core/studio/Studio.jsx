// client/src/components/core/studio/Studio.jsx
import React, { useCallback, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';

// --- PROVIDERS ---
import { SequenceProvider } from '../../../contexts/SequenceContext.jsx';
import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx';
import { UIStateProvider } from '../../../contexts/UIStateContext.jsx';
import { MediaProvider } from '../../../contexts/MediaContext.jsx';

// --- CHILD LAYOUT COMPONENTS ---
import TopHeader from '../main/TopHeader';
import PlaybackControls from '../transport/PlaybackControls';
import BeatGrid from '../main/BeatGrid';
import NotationDisplay from '../main/NotationDisplay';
import VisualizerDeck from './VisualizerDeck';
import SideJointSelector from '../pose_editor/SideJointSelector';
import { JointInputPanel } from '../pose_editor/JointInputPanel';
import PoseEditorModal from '../pose_editor/PoseEditorModal.jsx';
import IntentPalette from '../pose_editor/IntentPalette.jsx';
import { generatePoseThumbnail } from '../../../utils/thumbnailUtils';

// --- HOOKS ---
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import { useMedia } from '../../../contexts/MediaContext.jsx';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls.js';
import { useActionLogger } from '../../../hooks/useActionLogger';

// --- CONSTANTS ---
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW, UI_PADS_PER_BAR } from '../../../utils/constants';

// --- The Main Layout Component ---
const StudioLayout = () => {
    const log = useActionLogger('StudioLayout');

    // --- 1. CONTEXT CONSUMERS ---
    const { 
        songData, updateSongData, handleSaveSequence, handleLoadSequence, 
        addBar, removeBar, clearBar, copyBar, pasteBar, copiedBarData, 
        copyPose, pastePose, copiedPoseData, 
        bpm, setBpm, timeSignature, setTimeSignature,
        history, historyIndex, handleUndo, handleRedo
    } = useSequence();
    
    const { 
        isPlaying, isRecording, handlePlayPause, handleRecord, handleStop, 
        handleTapTempo, handleSkip, handleSkipIntervalChange,
        currentBar, currentStep
    } = usePlayback();

     const { 
        activeEditingJoint, setActiveEditingJoint, currentEditingBar, activeBeatIndex, 
        handleNavigateEditingBar, selectedKitName, setSelectedKitName, 
        isPoseEditorOpen, openPoseEditor, closePoseEditor,
        activeBeatData
    } = useUIState();


    const { setMediaFile, setMediaStream, mediaStream, videoPlayerRef } = useMedia();

    // --- 2. HOOKS INITIALIZATION ---
    useKeyboardControls();

    const onAnalysisComplete = useCallback((results) => {
        log('FullAnalysisComplete', { resultCount: results.length });
        updateSongData(currentData => {
            results.forEach(res => {
                const { bar, beat, poseData } = res;
                if (currentData[bar] && currentData[bar].beats[beat]) {
                    const targetBeat = currentData[bar].beats[beat];
                    targetBeat.jointInfo = poseData.jointInfo;
                    targetBeat.grounding = poseData.grounding;
                }
            });
            return currentData;
        }, 'Apply Full Analysis');
        toast.success("Motion analysis complete. Poses applied to sequence.");
    }, [updateSongData, log]);

    // CORRECTED: Call the hook once and destructure everything cleanly.
    // Pass the real onAnalysisComplete callback into the hook's options.
    const {
        isInitializing,
        isTracking,
        isAnalyzing,
        analysisProgress,
        error,
        livePoseData,
        startLiveTracking,
        stopLiveTracking,
        startFullAnalysis,
        cancelFullAnalysis
    } = useMotionAnalysis({ onAnalysisComplete });

    // --- 3. HANDLERS ---
    const saveSequenceHandler = useCallback(() => handleSaveSequence(selectedKitName), [handleSaveSequence, selectedKitName]);
    const loadSequenceHandler = useCallback((file) => handleLoadSequence(file, setSelectedKitName), [handleLoadSequence, setSelectedKitName]);

    const handleStartAnalysis = useCallback(() => {
        if (!videoPlayerRef.current) {
            toast.error("Video player not found. Please load media first.");
            return;
        }
        log('StartFullAnalysis');
        startFullAnalysis(videoPlayerRef.current, bpm, timeSignature, songData.length, UI_PADS_PER_BAR);
    }, [startFullAnalysis, videoPlayerRef, bpm, timeSignature, songData.length, log]);

    const handleActivateCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setMediaStream(stream);
            toast.success("Live camera activated!");
        } catch (err) {
            toast.error("Could not access camera. Please check permissions.");
        }
    }, [setMediaStream]);

    const handleJointDataUpdate = useCallback((jointAbbrev, newJointData) => {
        updateSongData(d => {
            const beat = d[currentEditingBar]?.beats[activeBeatIndex];
            if (beat) {
                if (!beat.jointInfo) beat.jointInfo = {};
                beat.jointInfo[jointAbbrev] = { ...beat.jointInfo[jointAbbrev], ...newJointData };
            }
            return d;
        }, `Update ${jointAbbrev}`);
    }, [currentEditingBar, activeBeatIndex, updateSongData]);

    const handleIntentSelect = useCallback((intentValue) => {
        if (!activeEditingJoint) { toast.info("Select a joint first."); return; }
        handleJointDataUpdate(activeEditingJoint, { intent: intentValue });
        toast.success(`Intent '${intentValue}' set for ${activeEditingJoint}`);
    }, [activeEditingJoint, handleJointDataUpdate]);

    const canUndo = historyIndex > 0;
    const canRedo = history.length > 1 && historyIndex < history.length - 1;

    // --- 4. CORE LOGIC EFFECTS ---
    useEffect(() => {
        if (mediaStream && videoPlayerRef.current) {
            log('StartLiveTracking');
            startLiveTracking(videoPlayerRef.current);
        }
        return () => {
            log('StopLiveTracking');
            stopLiveTracking();
        };
    }, [mediaStream, videoPlayerRef, startLiveTracking, stopLiveTracking, log]);

    useEffect(() => {
        if (!isPlaying || !isRecording || !livePoseData) {
            return;
        }

        // Asynchronously generate the thumbnail
        generatePoseThumbnail(livePoseData.jointInfo).then(thumbnail => {
            log('RecordPose', { bar: currentBar, beat: currentStep });
            updateSongData(d => {
                const beatToUpdate = d[currentBar]?.beats[currentStep];
                if (beatToUpdate) {
                    beatToUpdate.jointInfo = livePoseData.jointInfo;
                    beatToUpdate.grounding = livePoseData.grounding;
                    beatToUpdate.thumbnail = thumbnail; // <-- SAVE THE THUMBNAIL
                }
                return d;
            }, `Record Pose B${currentBar + 1}:S${currentStep + 1}`);
        });

    }, [currentBar, currentStep, isPlaying, isRecording, livePoseData, updateSongData, log]);

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
                        isAnalyzing={isAnalyzing} 
                        progress={analysisProgress} 
                        cancelFullAnalysis={cancelFullAnalysis}
                    />
                    
                    <PlaybackControls 
                        onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo}
                        isPlaying={isPlaying} onPlayPause={handlePlayPause} isRecording={isRecording} onRecord={handleRecord} onStop={handleStop} onTapTempo={handleTapTempo}
                        onAddBar={addBar} onRemoveBar={removeBar} onClearBar={() => clearBar(currentEditingBar)}
                        onNextBar={() => handleNavigateEditingBar(1)} onPrevBar={() => handleNavigateEditingBar(-1)}
                        onCopyBar={() => copyBar(currentEditingBar)} onPasteBar={() => pasteBar(currentEditingBar)} canPaste={!!copiedBarData}
                        onCopyPose={() => copyPose(currentEditingBar, activeBeatIndex)} onPastePose={() => pastePose(currentEditingBar, activeBeatIndex)} canPastePose={!!copiedPoseData}
                        onSkipForward={() => handleSkip(1)} onSkipBackward={() => handleSkip(-1)} onSkipIntervalChange={handleSkipIntervalChange}
                        bpm={bpm} onBpmChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                    />
                    
                    <main className="flex-grow grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-3 overflow-hidden min-h-0 mt-2">
                        <aside className="order-1 flex flex-col items-center gap-2 p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg">
                            <SideJointSelector 
                                side="L" 
                                onJointSelect={setActiveEditingJoint} 
                                activeEditingJoint={activeEditingJoint} 
                                // This line will now work correctly
                                weight={activeBeatData?.grounding?.L_weight ?? 50}
                            />
                            {activeEditingJoint && UI_LEFT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && 
                                <JointInputPanel key={`${activeEditingJoint}-L`} jointAbbrev={activeEditingJoint} onUpdate={handleJointDataUpdate} onClose={() => setActiveEditingJoint(null)} />}
                            <IntentPalette onIntentSelect={handleIntentSelect} />
                        </aside>

                        <div className="order-2 flex flex-col items-center justify-start gap-2 overflow-hidden">
                            <BeatGrid />
                            <NotationDisplay />
                            <VisualizerDeck />
                        </div>
                        
                        <aside className="order-3 flex flex-col items-center gap-2 p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg">
                           <SideJointSelector 
                                side="R" 
                                onJointSelect={setActiveEditingJoint} 
                                activeEditingJoint={activeEditingJoint} 
                                // This line will now work correctly
                                weight={activeBeatData?.grounding?.L_weight ?? 50}
                            />
                           {activeEditingJoint && UI_RIGHT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && 
                                <JointInputPanel key={`${activeEditingJoint}-R`} jointAbbrev={activeEditingJoint} onUpdate={handleJointDataUpdate} onClose={() => setActiveEditingJoint(null)} />}
                        </aside>
                    </main>
                </div>
            </div>

            <PoseEditorModal 
                isOpen={isPoseEditorOpen} 
                onClose={closePoseEditor} 
                barIndex={currentEditingBar} 
                beatIndex={activeBeatIndex} 
            />
        </DndContext>
    );
};


// The final export wrapper remains unchanged
const Studio = () => (
    <SequenceProvider>
        <UIStateProvider>
            <PlaybackProvider>
                <MediaProvider>
                    <StudioLayout />
                </MediaProvider>
            </PlaybackProvider>
        </UIStateProvider>
    </SequenceProvider>
);

export default Studio;