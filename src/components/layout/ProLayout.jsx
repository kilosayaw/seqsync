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
    const { isLoading, pendingFile, confirmLoad, cancelLoad, seekToTime, bpm, isPlaying, wavesurferInstance, mediaFile } = useMedia();
    // ADDED setActivePad HERE
    const { activePanel, noteDivision, selectedBar, setSelectedBar, mixerState, songData, assignSoundToPad, setSelectedBeat, songData: { barStartTimes }, totalBars, setActivePad } = useSequence();
    const { playSound } = useSound();
    
    const handlePadTrigger = useCallback((padIndex) => {
        // This function now works because setActivePad is defined.
        setActivePad(padIndex); 
        console.log(`[ProLayout] Pad ${padIndex + 1} triggered.`);

        const beatData = songData.bars[selectedBar - 1]?.beats[padIndex];
        
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
        if (mixerState.uploadedMedia && wavesurferInstance) {
            if (barStartTimes && barStartTimes.length > 0) {
                const barStartTime = barStartTimes[selectedBar - 1] || 0;
                const timePerSixteenth = (60 / bpm) / 4;
                seekToTime(barStartTime + (padIndex * timePerSixteenth));
            }
        }
    }, [mixerState, isPlaying, barStartTimes, selectedBar, bpm, playSound, setActivePad, seekToTime, wavesurferInstance, songData, assignSoundToPad, activePanel, mediaFile]);
    
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
                <LeftDeck onPadTrigger={handlePadTrigger} />
                <CenterConsole />
                <RightDeck onPadTrigger={handlePadTrigger} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog isVisible={!!pendingFile} message="How should this media be handled?" actions={mediaLoadActions} />
            {activePanel === 'sound' && <SoundBankPanel />}
            {activePanel === 'mixer' && <SourceMixerPanel />}
        </div>
    );
};
export default ProLayout;