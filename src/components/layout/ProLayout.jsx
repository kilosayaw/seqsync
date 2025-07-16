import React, { useState } from 'react'; // RESTORED: Import useState
import { useMedia } from '../../context/MediaContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useSound } from '../../context/SoundContext';
import LeftDeck from './LeftDeck';
import RightDeck from './RightDeck';
import CenterConsole from './CenterConsole';
import LevelMeter from '../ui/LevelMeter';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import LoadingOverlay from '../ui/LoadingOverlay';
import ConfirmDialog from '../ui/ConfirmDialog';
import SoundBankPanel from '../ui/SoundBankPanel';
import SourceMixerPanel from '../ui/SourceMixerPanel';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { seekToPad } from '../../utils/notationUtils';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad, wavesurferInstance, duration, detectedBpm } = useMedia();
    const { activePad, setActivePad, padMode, selectedBar } = useUIState();
    const { songData, barStartTimes, STEPS_PER_BAR } = useSequence();
    const { playSound, stopSound } = useSound();
    const { audioLevel } = usePlayback();

    // RESTORED: State for the visualizer mode is now correctly managed here.
    const [visualizerMode, setVisualizerMode] = useState('ribbon');

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

    const handleKeyEvent = (type, localPadIndex) => {
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
                <LevelMeter level={audioLevel} />
                {/* RESTORED: This now correctly passes down the state and the setter function. */}
                <CenterConsole 
                    visualizerMode={visualizerMode}
                    setVisualizerMode={setVisualizerMode}
                />
                <LevelMeter level={audioLevel} />
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