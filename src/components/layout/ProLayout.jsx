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
    const { songData, barStartTimes, totalBars, assignSoundToPad, STEPS_PER_BAR } = useSequence();

    const handlePadTrigger = useCallback((padIndex) => {
        const beatData = songData[((selectedBar - 1) * STEPS_PER_BAR) + (padIndex % 16)];
        
        // 1. ALWAYS play any sounds assigned to the pad. This enables polyphony.
        if (beatData && beatData.sounds && beatData.sounds.length > 0) {
            console.log(`[MasterControl] Playing ${beatData.sounds.length} assigned sound(s) for Pad ${padIndex + 1}.`);
            beatData.sounds.forEach(note => playSound(note));
        }

        // 2. Handle the mode-specific logic (Cueing vs. Drum Machine).
        if (mediaFile) {
            // --- CUE POINT MODE ---
            // In this mode, clicking a pad cues the media. No new sounds are assigned.
            if (noteDivision === 16) {
                setActivePad(padIndex);
                if (!isPlaying) {
                    const barStartTime = barStartTimes[selectedBar - 1] || 0;
                    const timePerSixteenth = (60 / (bpm || 120)) / 4;
                    const padTimeOffset = padIndex * timePerSixteenth;
                    seekToTime(barStartTime + padTimeOffset);
                }
            } else { // 1/8 or 1/4 mode
                const padsPerBar = noteDivision === 8 ? 8 : 4;
                const targetBar = Math.floor(padIndex / padsPerBar) + 1;
                const padInBar = padIndex % padsPerBar;
                if (targetBar > totalBars) return;
                if (targetBar !== selectedBar) setSelectedBar(targetBar);
                const targetBarStartTime = barStartTimes[targetBar - 1] || 0;
                const timePerDivision = (60 / (bpm || 120)) * (4 / noteDivision);
                const targetTime = targetBarStartTime + (padInBar * timePerDivision);
                
                // Seek to the time and immediately start playback.
                wavesurferInstance?.play(targetTime);
                
                setActivePad(null);
            }
        } else {
            // --- DRUM MACHINE MODE ---
            // In this mode, we select the pad and, if not editing, assign the default sound.
            if (editMode === 'none') {
                const note = PAD_TO_NOTE_MAP[padIndex];
                assignSoundToPad(padIndex, note);
            }
            setActivePad(padIndex);
        }
    }, [mediaFile, editMode, noteDivision, isPlaying, barStartTimes, selectedBar, bpm, playSound, setActivePad, seekToTime, totalBars, setSelectedBar, wavesurferInstance, songData, assignSoundToPad]);
    
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
                message="Loading media will switch to Cue Mode. Sounds can be layered on top via the Sound Bank. Continue?"
                onConfirm={confirmLoad}
                onCancel={cancelLoad}
            />
            <SoundBankPanel />
        </div>
    );
};
export default ProLayout;