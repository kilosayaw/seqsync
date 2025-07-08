// src/components/layout/ProLayout.jsx

import React, { useCallback } from 'react';
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
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, mediaFile, pendingFile, confirmLoad, cancelLoad } = useMedia();
    const { setActivePad, noteDivision, selectedBar, setSelectedBar, editMode, mixerState, padMode } = useUIState();
    const { playSound, stopSound } = useSound();
    const { seekToTime, bpm, isPlaying, wavesurferInstance } = usePlayback();
    const { songData, barStartTimes, totalBars, assignSoundToPad, STEPS_PER_BAR } = useSequence();

    const handlePadDown = useCallback((padIndex) => {
        // This is now the master on-press handler for both mouse and keyboard.
        
        let globalIndex = noteDivision === 16 
            ? ((selectedBar - 1) * STEPS_PER_BAR) + (padIndex % 16)
            : padIndex;
        
        // 1. Handle Sound Playback
        if (editMode === 'none' && mixerState.kitSounds) {
            const beatData = songData[globalIndex];
            if (beatData?.sounds?.length > 0) {
                beatData.sounds.forEach(note => playSound(note));
            } else if (!mediaFile) {
                const note = PAD_TO_NOTE_MAP[padIndex];
                playSound(note);
                // We only auto-assign the default sound in drum machine mode
                assignSoundToPad(globalIndex, note);
            }
        }

        // 2. Handle Media Cueing
        if (mediaFile && mixerState.uploadedMedia) {
            if (noteDivision === 16) {
                if (!isPlaying) {
                    const barStartTime = barStartTimes[selectedBar - 1] || 0;
                    const padTimeOffset = (padIndex % STEPS_PER_BAR) * ((60 / (bpm || 120)) / 4);
                    seekToTime(barStartTime + padTimeOffset);
                }
            } else {
                const padsPerBar = noteDivision === 8 ? 8 : 4;
                const targetBar = Math.floor(padIndex / padsPerBar) + 1;
                const padInBar = padIndex % padsPerBar;
                if (targetBar > totalBars) return;
                if (targetBar !== selectedBar) setSelectedBar(targetBar);
                const targetBarStartTime = barStartTimes[targetBar - 1] || 0;
                const timePerDivision = (60 / (bpm || 120)) * (4 / noteDivision);
                const targetTime = targetBarStartTime + (padInBar * timePerDivision);
                wavesurferInstance?.play(targetTime);
                setActivePad(null);
            }
        }

        // 3. Always set the active pad for editing purposes
        setActivePad(globalIndex);

    }, [
        mixerState, mediaFile, editMode, noteDivision, isPlaying, 
        barStartTimes, selectedBar, bpm, playSound, stopSound, setActivePad, 
        seekToTime, totalBars, setSelectedBar, wavesurferInstance, 
        songData, assignSoundToPad, padMode
    ]);

    const handlePadUp = useCallback((padIndex) => {
        // This handler is ONLY for GATE mode sound release.
        if (padMode === 'GATE' && editMode === 'none' && mixerState.kitSounds) {
            const globalIndex = noteDivision === 16 
                ? ((selectedBar - 1) * STEPS_PER_BAR) + (padIndex % 16)
                : padIndex;
            const beatData = songData[globalIndex];
            if (beatData?.sounds?.length > 0) {
                beatData.sounds.forEach(note => stopSound(note));
            } else if (!mediaFile) {
                const note = PAD_TO_NOTE_MAP[padIndex];
                stopSound(note);
            }
        }
    }, [padMode, editMode, mixerState, stopSound, songData, noteDivision, selectedBar]);
    
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
                <LeftDeck onPadDown={(localIndex) => handlePadDown(localIndex)} onPadUp={(localIndex) => handlePadUp(localIndex)} />
                <CenterConsole />
                <RightDeck onPadDown={(localIndex) => handlePadDown(localIndex + 8)} onPadUp={(localIndex) => handlePadUp(localIndex + 8)} />
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