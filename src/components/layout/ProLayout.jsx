import React from 'react';
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
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { useSound } from '../../context/SoundContext';
import { seekToPad } from '../../utils/notationUtils';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad, wavesurferInstance, duration } = useMedia();
    const { activePad, setActivePad, padMode, selectedBar } = useUIState();
    const { songData, barStartTimes, STEPS_PER_BAR, detectedBpm } = useSequence();
    const { playSound, stopSound } = useSound();

    const handlePadEvent = (type, padIndex) => {
        if (type === 'down') {
            setActivePad(padIndex);
            const soundNote = songData[padIndex]?.sounds?.[0];
            if (soundNote) playSound(soundNote);

            if (wavesurferInstance) {
                seekToPad({
                    wavesurfer: wavesurferInstance,
                    duration,
                    bpm: detectedBpm,
                    padIndex,
                    barStartTimes,
                    noteDivision: 8,
                });
            }
        } else if (type === 'up') {
            if (padMode === 'GATE') {
                const soundNote = songData[padIndex]?.sounds?.[0];
                if (soundNote) stopSound(soundNote);
            }
        }
    };

    // DEFINITIVE FIX: Updated keyboard handler logic.
    const handleKeyEvent = (type, localPadIndex) => {
        // Translate the local pad index (0-7) to a global pad index.
        const globalPadIndex = (selectedBar - 1) * STEPS_PER_BAR + localPadIndex;
        handlePadEvent(type, globalPadIndex);
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

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            
            <main className="main-content-area">
                <LeftDeck onPadEvent={handlePadEvent} />
                <CenterConsole />
                <RightDeck onPadEvent={handlePadEvent} />
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