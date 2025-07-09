// src/components/layout/ProLayout.jsx

import React, { useRef } from 'react';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import CenterConsole from './CenterConsole';
import LeftDeck from './LeftDeck';
import RightDeck from './RightDeck';
import LoadingOverlay from '../ui/LoadingOverlay';
import ConfirmDialog from '../ui/ConfirmDialog';
import SoundBankPanel from '../ui/SoundBankPanel';
import SourceMixerPanel from '../ui/SourceMixerPanel';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useMedia } from '../../context/MediaContext';
import OptionButtons from '../ui/OptionButtons';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad } = useMedia();
    
    // Refs to hold the trigger functions from each deck
    const leftDeckTrigger = useRef(() => {});
    const rightDeckTrigger = useRef(() => {});

    // This hook listens for keyboard events and calls the appropriate deck's trigger function
    useKeyboardControls(
        (padIndex) => leftDeckTrigger.current(padIndex),
        (padIndex) => rightDeckTrigger.current(padIndex)
    );

    const mediaLoadActions = [
        { label: "Cue Mode Only", onClick: () => confirmLoad('cue_only'), className: 'confirm-btn' },
        { label: "Polyphonic (Both)", onClick: () => confirmLoad('polyphonic'), className: 'poly-btn' },
        { label: "Cancel", onClick: cancelLoad, className: 'cancel-btn' }
    ];

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <div className="options-bar">
                <OptionButtons />
            </div>
            <main className="main-content-area">
                {/* Each deck receives a function to "register" its handler with the ProLayout */}
                <LeftDeck registerPadTrigger={(handler) => (leftDeckTrigger.current = handler)} />
                <CenterConsole />
                <RightDeck registerPadTrigger={(handler) => (rightDeckTrigger.current = handler)} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog
                isVisible={!!pendingFile}
                message="How should this media be handled?"
                actions={mediaLoadActions}
            />
            <SoundBankPanel />
            <SourceMixerPanel />
        </div>
    );
};
export default ProLayout;