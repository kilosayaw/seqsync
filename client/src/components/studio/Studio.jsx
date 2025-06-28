// src/components/studio/main/Studio.jsx
import React, { useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';

// PROVIDERS & CONTEXTS
import { SequenceProvider, useSequence } from '../../../contexts/SequenceContext.jsx';
import { UIStateProvider, useUIState } from '../../../contexts/UIStateContext.jsx';
import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx';
import { MediaProvider } from '../../../contexts/MediaContext.jsx';

// HOOKS
import { useKeyboardControls } from '../../../hooks/useKeyboardControls.js';

// CHILD COMPONENTS
import StudioHeader from './StudioHeader.jsx';
import BeatGrid from '../sequencer/BeatGrid.jsx';
import NotationDisplay from './NotationDisplay.jsx';
import VisualizerDeck from '../VisualizerDeck.jsx';
import SideJointSelector from '../pose_editor/SideJointSelector.jsx';
import TransitionSelector from '../pose_editor/TransitionSelector.jsx';
import { JointInputPanel } from '../pose_editor/JointInputPanel.jsx'; // <-- CORRECT IMPORT
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';

const StudioLayout = () => {
    const { applyTransitionToBeat, updateBeatDynamics } = useSequence();
    const { activeBeatData, activeEditingJoint, setActiveEditingJoint, currentEditingBar, activeBeatIndex } = useUIState();
    useKeyboardControls();
    
    const handleDragEnd = useCallback((event) => {
        // ... (drag and drop logic remains the same)
    }, [applyTransitionToBeat]);

    const handleJointUpdate = useCallback((jointAbbrev, dataType, value) => {
        const jointData = activeBeatData?.jointInfo?.[jointAbbrev] || {};
        const payload = { jointInfo: { [jointAbbrev]: { ...jointData, [dataType]: value } } };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, payload);
    }, [activeBeatData, currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const mainLeftGrounding = activeBeatData?.grounding?.L;
    const mainRightGrounding = activeBeatData?.grounding?.R;

    return (
        <DndContext onDragEnd={handleDragEnd}>
             <div className="p-2 bg-dark-bg text-text-primary h-screen flex flex-col font-sans select-none overflow-hidden">
                <header className="flex-shrink-0"><StudioHeader /></header>
                
                <main className="flex-grow grid grid-cols-[240px_1fr_240px] gap-3 overflow-hidden py-2">
                    <aside className="flex flex-col items-center h-full overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg pt-4 space-y-2">
                        <SideJointSelector side="L" />
                        {activeEditingJoint && UI_LEFT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && (
                            <JointInputPanel
                                jointAbbrev={activeEditingJoint}
                                jointData={activeBeatData?.jointInfo?.[activeEditingJoint]}
                                footGrounding={mainLeftGrounding}
                                onClose={() => setActiveEditingJoint(null)}
                                onUpdate={handleJointUpdate}
                            />
                        )}
                    </aside>

                    <div className="flex flex-col gap-2 overflow-hidden">
                        <div className="flex-shrink-0"><BeatGrid /></div>
                        <div className="flex-grow min-h-0"><VisualizerDeck /></div>
                    </div>
                    
                    <aside className="flex flex-col items-center h-full overflow-y-auto scrollbar-thin scrollbar-thumb-element-bg pt-4 space-y-2">
                        <SideJointSelector side="R" />
                        {activeEditingJoint && UI_RIGHT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && (
                            <JointInputPanel
                                jointAbbrev={activeEditingJoint}
                                jointData={activeBeatData?.jointInfo?.[activeEditingJoint]}
                                footGrounding={mainRightGrounding}
                                onClose={() => setActiveEditingJoint(null)}
                                onUpdate={handleJointUpdate}
                            />
                        )}
                    </aside>
                </main>

                <footer className="flex-shrink-0 mt-auto"><NotationDisplay /></footer>
                <TransitionSelector />
            </div>
        </DndContext>
    );
};

const Studio = () => ( 
    <SequenceProvider><UIStateProvider><PlaybackProvider><MediaProvider>
        <StudioLayout /> 
    </MediaProvider></PlaybackProvider></UIStateProvider></SequenceProvider> 
);
export default Studio;