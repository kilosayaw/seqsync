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
import { useMedia } from '../../context/MediaContext';
import { useSequence } from '../../context/SequenceContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import './ProLayout.css';

const ProLayout = () => {
    // --- Destructure ALL necessary state and functions from the hooks ---
    const { isLoading, pendingFile, confirmLoad, cancelLoad, seekToTime, bpm, isPlaying, wavesurferInstance, mediaFile } = useMedia();
    const { 
        activePanel, 
        selectedBar, 
        mixerState, 
        songData, 
        assignSoundToPad, 
        setSelectedBeat,
        updateJointData // Get the joint update function
    } = useSequence();
    const { playSound } = useSound();
    
    // --- MERGED AND CORRECTED HANDLERS ---

    // This handler is for when a pad is clicked (by mouse or keyboard)
    const handlePadTrigger = useCallback((padIndex) => {
        setSelectedBeat(padIndex); 
        console.log(`[ProLayout] Pad ${padIndex + 1} triggered.`);

        const beatData = songData.bars[selectedBar - 1]?.beats[padIndex];
        
        // Sound playback logic
        if (mixerState.kitSounds) {
            if (beatData?.sounds?.length > 0) {
                beatData.sounds.forEach(note => playSound(note));
            } else if (!mediaFile && activePanel !== 'sound') {
                const note = PAD_TO_NOTE_MAP[padIndex];
                playSound(note);
                if (assignSoundToPad) {
                    assignSoundToPad(selectedBar - 1, padIndex, note);
                }
            }
        }

        // Media seeking logic
        if (mixerState.uploadedMedia && wavesurferInstance && wavesurferInstance.isReady) {
            const barStartTimes = songData.barStartTimes || [];
            const barStartTime = barStartTimes[selectedBar - 1] || 0;
            const timePerSixteenth = (60 / bpm) / 4;
            const targetTime = barStartTime + (padIndex * timePerSixteenth);
            seekToTime(targetTime);
        }
    }, [
        mixerState, mediaFile, activePanel, songData, selectedBar, 
        bpm, playSound, setSelectedBeat, seekToTime, wavesurferInstance, 
        assignSoundToPad
    ]);
    
    // This handler is specifically for updating joint data from the Rotary Controllers
    const handleJointDataUpdate = useCallback((barIndex, beatIndex, newJoints) => {
        updateJointData(barIndex, beatIndex, newJoints);
    }, [updateJointData]);
    
    // Wire up the keyboard controls to the pad trigger
    useKeyboardControls(handlePadTrigger);

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
                {/* Correctly pass BOTH handlers down to the decks */}
                <LeftDeck onPadTrigger={handlePadTrigger} onJointUpdate={handleJointDataUpdate} />
                <CenterConsole />
                <RightDeck onPadTrigger={handlePadTrigger} onJointUpdate={handleJointDataUpdate} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog isVisible={!!pendingFile} message="How should this media be handled?" actions={mediaLoadActions} />
            {activePanel === 'sound' && <SoundBankPanel />}
            {activePanel === 'mixer' && <SourceMixerPanel />}
        </div>
    );
};

export default ProLayout;