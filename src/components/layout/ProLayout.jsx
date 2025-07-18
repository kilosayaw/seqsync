import React, { useMemo } from 'react';
import { useMedia } from '../../context/MediaContext.jsx';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import { usePlayback } from '../../context/PlaybackContext.jsx';
import { useSound } from '../../context/SoundContext.jsx';
import LeftDeck from './LeftDeck.jsx';
import RightDeck from './RightDeck.jsx';
import CenterConsole from './CenterConsole.jsx';
import LevelMeter from '../ui/LevelMeter.jsx';
import TopNavBar from '../ui/TopNavBar.jsx';
import MediaViewer from '../ui/MediaViewer.jsx';
import NotationDisplay from '../ui/NotationDisplay.jsx';
import LoadingOverlay from '../ui/LoadingOverlay.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import SoundBankPanel from '../ui/SoundBankPanel.jsx';
import SourceMixerPanel from '../ui/SourceMixerPanel.jsx';
import { useKeyboardControls } from '../../hooks/useKeyboardControls.js';
import { usePlaybackSync } from '../../hooks/usePlaybackSync.js';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad } = useMedia();
    const { selectedJoints, activePad, padMode, selectedBar } = useUIState();
    const { songData, STEPS_PER_BAR } = useSequence();
    const { audioLevel, currentTime, isPlaying, currentBar, currentBeat } = usePlayback();
    const { playSound, stopSound } = useSound();
    
    const { handlePadClick } = usePlaybackSync();

    const onPadEvent = (type, padIndex) => {
        if (type === 'down') {
            handlePadClick(padIndex);
            const soundNote = songData[padIndex]?.sounds?.[0];
            if (soundNote) playSound(soundNote);
        } else if (type === 'up') {
            if (padMode === 'GATE') {
                const soundNote = songData[padIndex]?.sounds?.[0];
                if (soundNote) stopSound(soundNote);
            }
        }
    };

    const handleKeyEvent = (type, localPadIndex) => {
        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + localPadIndex;
        onPadEvent(type, globalPadIndex);
    };

    useKeyboardControls(
        (localPadIndex) => handleKeyEvent('down', localPadIndex),
        (localPadIndex) => handleKeyEvent('up', localPadIndex)
    );

    const mediaLoadActions = [
        { label: "Cue Mode Only", onClick: () => confirmLoad('cue_only'), className: 'confirm-btn' },
        { label: "Polyphonic (Both)", onClick: () => confirmLoad('polyphonic'), className: 'poly-btn' },
        { label: "Cancel", onClick: cancelLoad, className: 'cancel-btn' }
    ];

    const barBeatDisplayMemoProps = useMemo(() => ({
        currentTime, isPlaying, playingBar: currentBar, playingBeat: currentBeat,
        selectedBar, activePad, stepsPerBar: STEPS_PER_BAR
    }), [currentTime, isPlaying, currentBar, currentBeat, selectedBar, activePad, STEPS_PER_BAR]);

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <MediaViewer />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck onPadEvent={onPadEvent} />
                <LevelMeter level={audioLevel} />
                <CenterConsole selectedJoints={selectedJoints} barBeatDisplayProps={barBeatDisplayMemoProps} />
                <LevelMeter level={audioLevel} />
                <RightDeck onPadEvent={onPadEvent} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog isVisible={!!pendingFile} message="How should this media be handled?" actions={mediaLoadActions} />
            <SoundBankPanel />
            <SourceMixerPanel />
        </div>
    );
};
export default ProLayout;