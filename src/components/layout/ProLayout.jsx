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
    const { setActivePad, noteDivision, selectedBar, setSelectedBar, editMode, mixerState } = useUIState();
    const { playSound } = useSound();
    const { seekToTime, bpm, isPlaying, wavesurferInstance } = usePlayback();
    const { songData, barStartTimes, totalBars, assignSoundToPad, STEPS_PER_BAR } = useSequence();

    const handlePadTrigger = useCallback((padIndex) => {
        console.log(`[MasterControl] Pad ${padIndex + 1} triggered.`);

        let globalIndex;
        if (noteDivision === 16) {
            globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + (padIndex % 16);
        } else {
            globalIndex = padIndex;
        }
        
        const beatData = songData[globalIndex];

        if (mixerState.kitSounds) {
            if (beatData?.sounds?.length > 0) {
                beatData.sounds.forEach(note => playSound(note));
            } else if (!mediaFile && editMode === 'none') {
                const note = PAD_TO_NOTE_MAP[padIndex];
                playSound(note);
                assignSoundToPad(globalIndex, note);
            }
        }

        if (mixerState.uploadedMedia && mediaFile) {
            if (noteDivision === 16) {
                setActivePad(globalIndex);
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
        } else {
            setActivePad(globalIndex);
        }
    }, [
        mixerState, mediaFile, editMode, noteDivision, isPlaying, 
        barStartTimes, selectedBar, bpm, playSound, setActivePad, 
        seekToTime, totalBars, setSelectedBar, wavesurferInstance, 
        songData, assignSoundToPad
    ]);
    
    useKeyboardControls(handlePadTrigger);

    // Define the new actions for the dialog
    const mediaLoadActions = [
        { 
            label: "Cue Mode Only", 
            onClick: () => confirmLoad('cue_only'),
            className: 'confirm-btn' 
        },
        { 
            label: "Polyphonic (Both)", 
            onClick: () => confirmLoad('polyphonic'),
            className: 'poly-btn'
        },
        { label: "Cancel", onClick: cancelLoad, className: 'cancel-btn' }
    ];

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck onPadTrigger={(localIndex) => handlePadTrigger(localIndex)} />
                <CenterConsole />
                <RightDeck onPadTrigger={(localIndex) => handlePadTrigger(localIndex + 8)} />
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