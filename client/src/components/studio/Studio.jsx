// src/components/studio/main/Studio.jsx
import React from 'react';
import { DndContext } from '@dnd-kit/core';
import { SequenceProvider } from '../../../contexts/SequenceContext.jsx';
import { UIStateProvider } from '../../../contexts/UIStateContext.jsx';
import { PlaybackProvider } from '../../../contexts/PlaybackContext.jsx';
import { MediaProvider } from '../../../contexts/MediaContext.jsx';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls.js';
import StudioHeader from './StudioHeader.jsx';
import BeatGrid from '../sequencer/BeatGrid.jsx';
import NotationDisplay from './NotationDisplay.jsx';
import VisualizerDeck from '../VisualizerDeck.jsx';
import SideBar from './SideBar.jsx';
import TransitionSelector from '../pose_editor/TransitionSelector.jsx';

const StudioLayout = () => {
    useKeyboardControls();
    const handleDragEnd = () => {}; // Logic to be added later

    return (
        <DndContext onDragEnd={handleDragEnd}>
             <div className="p-2 bg-dark-bg text-text-primary h-screen flex flex-col font-sans select-none overflow-hidden">
                <header className="flex-shrink-0"><StudioHeader /></header>
                <main className="flex-grow grid grid-cols-[240px_1fr_240px] gap-3 overflow-hidden py-2">
                    <SideBar side="L" />
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <div className="flex-shrink-0"><BeatGrid /></div>
                        <div className="flex-grow min-h-0"><VisualizerDeck /></div>
                    </div>
                    <SideBar side="R" />
                </main>
                <footer className="flex-shrink-0 mt-auto"><NotationDisplay /></footer>
                <TransitionSelector />
            </div>
        </DndContext>
    );
};

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