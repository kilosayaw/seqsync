import React, { useCallback, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';

// PROVIDERS & CONTEXTS
import { SequenceProvider, useSequence } from '../../../contexts/SequenceContext.jsx';
import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx';
import { UIStateProvider, useUIState } from '../../../contexts/UIStateContext.jsx';
import { MediaProvider, useMedia } from '../../../contexts/MediaContext.jsx';
import { AnalysisProvider } from '../../../contexts/AnalysisContext.jsx';

// HOOKS
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis.js';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls.js';

// CHILD COMPONENTS
import StudioHeader from '../main/StudioHeader.jsx';
import BeatGrid from '../main/BeatGrid.jsx';
import NotationDisplay from '../main/NotationDisplay.jsx';
import VisualizerDeck from './VisualizerDeck.jsx';
import SideJointSelector from '../pose_editor/SideJointSelector.jsx';
import PoseEditorModal from '../pose_editor/PoseEditorModal.jsx';
import TransitionSelector from '../pose_editor/TransitionSelector.jsx';
import JointInputPanel from '../pose_editor/JointInputPanel.jsx';
import IntentPalette from '../pose_editor/IntentPalette.jsx';

// UTILS
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';

const StudioLayout = () => {
    // --- CONTEXTS ---
    const { initializeSequenceFromOnsets, applyTransitionToBeat, updateBeatDynamics } = useSequence();
    const { livePoseData, startLiveTracking, stopLiveTracking } = useMotionAnalysis({ onPoseUpdate: null });
    const { setMediaFile, mediaStream, mediaDuration, videoPlayerRef } = useMedia();
    const { bpm, setBpm } = useSequence();
    const { activeEditingJoint, setActiveEditingJoint, currentEditingBar, activeBeatIndex, activeIntent, isPoseEditorOpen, closePoseEditor } = useUIState();

    useKeyboardControls();

    const handleJointDataUpdate = useCallback((jointAbbrev, newJointData) => {
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [jointAbbrev]: newJointData }
        });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleIntentSelect = useCallback((intentValue) => {
        if (!activeEditingJoint) {
            toast.info("Select a joint before assigning an intent.");
            return;
        }
        handleJointDataUpdate(activeEditingJoint, { intent: intentValue });
        toast.success(`Intent '${intentValue}' set for ${activeEditingJoint}`);
    }, [activeEditingJoint, handleJointDataUpdate]);

    const handleFileSelection = useCallback((file) => {
        if (!file) return;
        const onBpmDetected = (detectedBpm) => setBpm(detectedBpm);
        const onOnsetsDetected = (onsets) => initializeSequenceFromOnsets(onsets, bpm, mediaDuration);
        setMediaFile(file, onBpmDetected, onOnsetsDetected);
    }, [setMediaFile, setBpm, initializeSequenceFromOnsets, bpm, mediaDuration]);
    
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over || !active.data.current || !over.data.current) return;
        if (active.data.current.type === 'transition-icon' && over.data.current.type === 'transition-drop') {
            const curveType = active.id;
            const targetBeatIndex = over.data.current.targetBeat;
            applyTransitionToBeat(currentEditingBar, targetBeatIndex, curveType, active.data.current.targetMode);
            toast.success(`Transition '${curveType}' applied to beat ${targetBeatIndex + 1}.`);
        }
    }, [applyTransitionToBeat, currentEditingBar]);

    useEffect(() => {
        if (mediaStream && videoPlayerRef.current) startLiveTracking(videoPlayerRef.current);
        return () => stopLiveTracking();
    }, [mediaStream, videoPlayerRef, startLiveTracking, stopLiveTracking]);

    return (
        <DndContext onDragEnd={handleDragEnd}>
             <div className="p-2 bg-dark-bg text-text-primary h-screen flex flex-col font-sans select-none overflow-hidden" style={{ height: '100dvh' }}>
                <header className="flex-shrink-0">
                    <StudioHeader />
                </header>
                
                <main className="flex-grow grid grid-cols-[140px_1fr_140px] gap-3 overflow-hidden py-2">
                    {/* Left Sidebar */}
                    <aside className="flex flex-col items-center h-full overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg pt-4 space-y-2">
                        <SideJointSelector side="L" />
                        {activeEditingJoint && UI_LEFT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && (
                            <div className="w-full p-1 space-y-2">
                                {activeEditingJoint !== 'LK' && (
                                    <JointInputPanel jointAbbrev={activeEditingJoint} onClose={() => setActiveEditingJoint(null)} />
                                )}
                                <IntentPalette onIntentSelect={handleIntentSelect} activeIntent={activeIntent} />
                            </div>
                        )}
                    </aside>

                    {/* Center Content */}
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <div className="flex-shrink-0">
                             <BeatGrid />
                        </div>
                        <div className="flex-grow min-h-0">
                            <VisualizerDeck livePoseData={livePoseData} />
                        </div>
                    </div>
                    
                    {/* Right Sidebar */}
                    <aside className="flex flex-col items-center h-full overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg pt-4 space-y-2">
                        <SideJointSelector side="R" />
                        {activeEditingJoint && UI_RIGHT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && (
                            <div className="w-full p-1 space-y-2">
                                {activeEditingJoint !== 'RK' && (
                                     <JointInputPanel jointAbbrev={activeEditingJoint} onClose={() => setActiveEditingJoint(null)} />
                                )}
                                <IntentPalette onIntentSelect={handleIntentSelect} activeIntent={activeIntent} />
                            </div>
                         )}
                    </aside>
                </main>

                <footer className="flex-shrink-0 mt-auto">
                    <NotationDisplay />
                </footer>
                
                <TransitionSelector />
                <PoseEditorModal isOpen={isPoseEditorOpen} onClose={closePoseEditor} barIndex={currentEditingBar} beatIndex={activeBeatIndex} />
            </div>
        </DndContext>
    );
};

// The provider wrapper remains the same, ensuring all contexts are available.
const Studio = () => ( 
    <SequenceProvider> 
        <UIStateProvider> 
            <PlaybackProvider> 
                <MediaProvider> 
                    <AnalysisProvider> 
                        <StudioLayout /> 
                    </AnalysisProvider> 
                </MediaProvider> 
            </PlaybackProvider> 
        </UIStateProvider> 
    </SequenceProvider> 
);
export default Studio;