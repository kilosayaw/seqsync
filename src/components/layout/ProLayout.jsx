// src/components/layout/ProLayout.jsx

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
import { useKeyboardControls } from '../../hooks/useKeyboardControls'; // DEFINITIVE: Re-import hook
import { useMedia } from '../../context/MediaContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { useSound } from '../../context/SoundContext';
import { seekToPad } from '../../utils/notationUtils';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, pendingFile, confirmLoad, cancelLoad, wavesurferInstance, duration, detectedBpm } = useMedia();
    const { setActivePad, padMode, selectedBar, noteDivision } = useUIState();
    const { songData, barStartTimes } = useSequence();
    const { playSound, stopSound } = useSound();

    // DEFINITIVE: Restore pad handling logic to the top-level component
    const handlePadDown = (padIndex) => {
        console.log(`[ProLayout] Pad Down: ${padIndex}`);
        setActivePad(padIndex);
        const soundNote = songData[padIndex]?.sounds?.[0];
        if (soundNote) playSound(soundNote);

        if (wavesurferInstance) {
            seekToPad({
                wavesurfer: wavesurferInstance,
                duration,
                bpm: detectedBpm,
                padIndex,
                bar: selectedBar,
                barStartTimes,
                noteDivision,
            });
        }
    };

    const handlePadUp = (padIndex) => {
        if (padMode === 'GATE') {
            const soundNote = songData[padIndex]?.sounds?.[0];
            if (soundNote) stopSound(soundNote);
        }
    };
    
    // DEFINITIVE: Restore keyboard controls
    useKeyboardControls(handlePadDown, handlePadUp);

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
                <LeftDeck onPadDown={handlePadDown} onPadUp={handlePadUp} />
                <CenterConsole />
                <RightDeck onPadDown={handlePadDown} onPadUp={handlePadUp} />
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