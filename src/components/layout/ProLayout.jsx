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
import SoundBankPanel from '../ui/SoundBankPanel'; // Import the new panel
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading, mediaFile, pendingFile, confirmLoad, cancelLoad } = useMedia();
    const { setActivePad, noteDivision, selectedBar, setSelectedBar, editMode } = useUIState();
    const { playSound } = useSound();
    const { seekToTime, bpm, isPlaying, wavesurferInstance } = usePlayback();
    const { barStartTimes, totalBars } = useSequence();

    const handlePadTrigger = useCallback((padIndex) => {
        if (mediaFile) {
            // CUE POINT MODE
            if (noteDivision === 16) {
                setActivePad(padIndex);
                if (!isPlaying) {
                    const barStartTime = barStartTimes[selectedBar - 1] || 0;
                    const padTimeOffset = padIndex * ((60 / (bpm || 120)) / 4);
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
                seekToTime(targetTime);
                wavesurferInstance?.play();
                setActivePad(null);
            }
        } else {
            // DRUM MACHINE MODE
            if (editMode === 'none') {
                const note = PAD_TO_NOTE_MAP[padIndex];
                playSound(note);
            }
            setActivePad(padIndex);
        }
    }, [mediaFile, editMode, noteDivision, isPlaying, barStartTimes, selectedBar, bpm, playSound, setActivePad, seekToTime, totalBars, setSelectedBar, wavesurferInstance]);
    
    useKeyboardControls(handlePadTrigger);

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck onPadTrigger={handlePadTrigger} />
                <CenterConsole />
                <RightDeck onPadTrigger={handlePadTrigger} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog
                isVisible={!!pendingFile}
                message="Loading media will switch to Cue Mode. The current drum sequence will be cleared. Continue?"
                onConfirm={confirmLoad}
                onCancel={cancelLoad}
            />
            {/* Render the new Sound Bank Panel */}
            <SoundBankPanel />
        </div>
    );
};
export default ProLayout;