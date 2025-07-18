import React, { useMemo } from 'react'; // Import useMemo
import { useMedia } from '../../context/MediaContext.jsx';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import { usePlayback } from '../../context/PlaybackContext.jsx';
import { useSound } from '../../context/SoundContext.jsx';
import LeftDeck from './LeftDeck.jsx';
import RightDeck from './RightDeck.jsx';
import CenterConsole from './CenterConsole.jsx';
import LevelMeter from '../ui/LevelMeter.jsx';
import TopNavBar from '../ui/TopNavBar.jsx';
import MediaViewer from '../ui/MediaViewer.jsx';
import NotationDisplay from '../ui/NotationDisplay.jsx';
import LoadingOverlay from '../ui/LoadingOverlay.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import SoundBankPanel from '../ui/SoundBankPanel.jsx';
import SourceMixerPanel from '../ui/SourceMixerPanel.jsx';
import { useKeyboardControls } from '../../hooks/useKeyboardControls.js';
import { seekToPad } from '../../utils/notationUtils.js';
import './ProLayout.css';

const ProLayout = () => {
    const { 
        isLoading, pendingFile, confirmLoad, cancelLoad, 
        wavesurferInstance, videoRef, mediaType, duration, detectedBpm 
    } = useMedia();
    
    const { activePad, setActivePad, padMode, selectedBar, selectedJoints } = useUIState();
    const { songData, barStartTimes, STEPS_PER_BAR } = useSequence();
    const { playSound, stopSound } = useSound();
    const { audioLevel, currentTime, isPlaying, playingBar, playingBeat } = usePlayback();

    const handlePadEvent = (type, padIndex) => { /* ... (This function is correct and unchanged) */ };
    const handleKeyEvent = (type, localPadIndex) => { /* ... (This function is correct and unchanged) */ };
    useKeyboardControls(/* ... */);
    const mediaLoadActions = [ /* ... */ ];

    // --- DEFINITIVE FIX: Memoize props to prevent flickering ---
    const barBeatDisplayMemoProps = useMemo(() => ({
        currentTime,
        isPlaying,
        playingBar,
        playingBeat,
        selectedBar,
        activePad,
        stepsPerBar: STEPS_PER_BAR
    }), [currentTime, isPlaying, playingBar, playingBeat, selectedBar, activePad, STEPS_PER_BAR]);
    // --- END OF FIX ---

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <MediaViewer />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck onPadEvent={handlePadEvent} />
                <LevelMeter level={audioLevel} />
                <CenterConsole selectedJoints={selectedJoints} barBeatDisplayProps={barBeatDisplayMemoProps} />
                <LevelMeter level={audioLevel} />
                <RightDeck onPadEvent={handlePadEvent} />
            </main>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog isVisible={!!pendingFile} message="How should this media be handled?" actions={mediaLoadActions} />
            <SoundBankPanel />
            <SourceMixerPanel />
        </div>
    );
};
export default ProLayout;