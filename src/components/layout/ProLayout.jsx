import React, { useMemo, useCallback } from 'react';
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
import { usePlaybackSync } from '../../hooks/usePlaybackSync.js'; // The FIXED hook
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad } = useMedia();
    const { selectedJoints, activePad, padMode, selectedBar } = useUIState();
    const { songData, STEPS_PER_BAR } = useSequence();
    const { audioLevel, currentTime, isPlaying, currentBar, currentBeat } = usePlayback();
    const { playSound, stopSound } = useSound();
    
    // This now gets the corrected, reliable navigation functions.
    const { handlePadClick } = usePlaybackSync();

    // This is the single handler for all pad interactions (mouse or keyboard).
    const onPadEvent = useCallback((type, padIndex) => {
        if (!songData || !songData[padIndex]) return;

        if (type === 'down') {
            handlePadClick(padIndex); // This now correctly updates state and seeks media.
            const soundNote = songData[padIndex]?.sounds?.[0];
            if (soundNote) playSound(soundNote);
        } else if (type === 'up') {
            if (padMode === 'GATE') {
                const soundNote = songData[padIndex]?.sounds?.[0];
                if (soundNote) stopSound(soundNote);
            }
        }
    }, [songData, padMode, handlePadClick, playSound, stopSound]);

    // This function translates a local key press (0-7) to a global pad index.
    const handleKeyEvent = useCallback((type, localPadIndex) => {
        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + localPadIndex;
        onPadEvent(type, globalPadIndex);
    }, [selectedBar, STEPS_PER_BAR, onPadEvent]);

    // Your keyboard hook is correct and will now work with the reliable handler.
    useKeyboardControls(
        (localPadIndex) => handleKeyEvent('down', localPadIndex),
        (localPadIndex) => handleKeyEvent('up', localPadIndex)
    );

    // Your existing logic below this is correct.
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