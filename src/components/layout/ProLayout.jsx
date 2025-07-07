// src/components/layout/ProLayout.jsx

import React, { useCallback } from 'react';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import CenterConsole from './CenterConsole';
import LeftDeck from './LeftDeck';
import RightDeck from './RightDeck';
import LoadingOverlay from '../ui/LoadingOverlay';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();
    const { setActivePad, noteDivision, selectedBar, setSelectedBar, editMode } = useUIState();
    const { playSound } = useSound();
    const { seekToTime, bpm, isPlaying } = usePlayback();
    const { barStartTimes, totalBars } = useSequence();

    // This is the single, centralized handler for all pad interactions (mouse or keyboard)
    const handlePadTrigger = useCallback((padIndex) => {
        // 1. Conditionally play the sound
        if (editMode === 'none') {
            const note = PAD_TO_NOTE_MAP[padIndex];
            playSound(note);
        } else {
            console.log(`[MasterControl] Sound playback skipped (in edit mode).`);
        }

        // 2. Determine behavior based on the current note division mode
        if (noteDivision === 16) {
            // In 1/16 mode, we select the pad for editing.
            console.log(`[MasterControl] 1/16 Mode: Pad ${padIndex + 1} triggered.`);
            setActivePad(padIndex);

            // If paused, we also seek the playhead to that pad's position
            if (!isPlaying) {
                const barStartTime = barStartTimes[selectedBar - 1] || 0;
                const timePerSixteenth = (60 / (bpm || 120)) / 4;
                const padTimeOffset = padIndex * timePerSixteenth; // This is correct as padIndex is the global index
                const targetTime = barStartTime + padTimeOffset;
                seekToTime(targetTime);
            }
        } else {
            // In 1/8 or 1/4 (cue) mode, we jump to a new time without selecting a pad.
            console.log(`[MasterControl] Cue Mode (1/${noteDivision}): Pad ${padIndex + 1} triggered.`);
            const padsPerBar = noteDivision === 8 ? 8 : 4;
            const targetBar = Math.floor(padIndex / padsPerBar) + 1;
            const padInBar = padIndex % padsPerBar;

            if (targetBar > totalBars) return;
            
            if (targetBar !== selectedBar) {
                setSelectedBar(targetBar);
            }

            const targetBarStartTime = barStartTimes[targetBar - 1] || 0;
            const timePerDivision = (60 / (bpm || 120)) * (4 / noteDivision);
            const targetTime = targetBarStartTime + (padInBar * timePerDivision);
            
            seekToTime(targetTime);
            setActivePad(null);
        }
    }, [editMode, noteDivision, isPlaying, barStartTimes, selectedBar, bpm, playSound, setActivePad, seekToTime, totalBars, setSelectedBar]);
    
    // Call the keyboard hook with our master handler
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
        </div>
    );
};
export default ProLayout;