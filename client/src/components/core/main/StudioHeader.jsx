import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

// Child Components
import LoadSave from '../../common/LoadSave';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import SoundBank from '../sequencer/SoundBank';
import TimecodeDisplay from '../transport/TimecodeDisplay';
import BarDisplay from '../transport/BarDisplay';

// Contexts & Hooks
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import { useMedia } from '../../../contexts/MediaContext';

// Constants & Icons
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faVideo, faUndo, faRedo, faRecordVinyl, 
    faPlay, faPause, faStop, faMicrochip, faSpinner, 
    faTimes, faCopy, faPaste 
} from '@fortawesome/free-solid-svg-icons';

const ControlGroup = ({ children }) => <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-md">{children}</div>;
ControlGroup.propTypes = { children: PropTypes.node.isRequired };

const StudioHeader = () => {
    // --- CONTEXTS ---
    const { isPlaying, isRecording, handlePlayPause, handleRecord, handleStop } = usePlayback();
    // --- DEFINITIVE FIX: Destructure history and historyIndex correctly ---
    const { bpm, setBpm, handleTapTempo, handleUndo, handleRedo, history, historyIndex, handleSaveSequence, handleLoadSequence, selectedKitName } = useSequence();
    const { isAnalyzing, progress, cancelFullAnalysis, setMediaFile, setMediaStream } = useMedia();
    const { viewMode, setViewMode, soundKitsObject, setSelectedKitName, currentSoundInBank, setCurrentSoundInBank, copyPose, pastePose, copiedPoseData, currentEditingBar, activeBeatIndex } = useUIState();

    // --- DEFINITIVE FIX: Logic now correctly references the state and ref ---
    const canUndo = historyIndex.current > 0;
    const canRedo = history.length > 1 && historyIndex.current < history.length - 1;

    const handleActivateCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (stream) setMediaStream(stream);
        } catch (err) {
            toast.error("Could not access camera.");
        }
    }, [setMediaStream]);
    
    return (
        <header className="flex-shrink-0 p-2 bg-gray-800/60 rounded-lg shadow-md flex items-center justify-between gap-x-4">
            {/* --- LEFT GROUP: FILE OPS --- */}
            <div className="flex items-center gap-2">
                <LoadSave onSave={() => handleSaveSequence(selectedKitName)} onLoad={handleLoadSequence} onFileSelected={setMediaFile} />
                <Button onClick={handleActivateCamera} variant="secondary" size="sm" title="Activate Live Camera"><FontAwesomeIcon icon={faVideo} className="mr-2" />Live Cam</Button>
            </div>

            {/* --- TRANSPORT & TIME --- */}
            <div className="flex items-center gap-4">
                <ControlGroup>
                    <Tooltip content="Undo"><Button onClick={handleUndo} disabled={!canUndo} size="sm" variant="secondary"><FontAwesomeIcon icon={faUndo} /></Button></Tooltip>
                    <Tooltip content="Redo"><Button onClick={handleRedo} disabled={!canRedo} size="sm" variant="secondary"><FontAwesomeIcon icon={faRedo} /></Button></Tooltip>
                </ControlGroup>
                <ControlGroup>
                    <Tooltip content="Record Arm/Disarm"><Button onClick={handleRecord} size="lg" variant={isRecording ? 'danger' : 'secondary'}><FontAwesomeIcon icon={faRecordVinyl} className={isRecording ? 'animate-pulse' : ''}/></Button></Tooltip>
                    <Tooltip content="Play/Pause"><Button onClick={handlePlayPause} size="lg" variant="primary"><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></Button></Tooltip>
                    <Tooltip content="Stop"><Button onClick={handleStop} size="lg" variant="secondary"><FontAwesomeIcon icon={faStop} /></Button></Tooltip>
                </ControlGroup>
                <TimecodeDisplay />
                <ControlGroup>
                    <div className="flex flex-col items-center">
                        <input type="number" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value, 10))} className="w-20 bg-gray-900 text-center rounded p-1 text-2xl font-bold" />
                        <label className="text-xs text-gray-400">BPM</label>
                    </div>
                    <Button onClick={handleTapTempo} size="sm" variant="secondary" className="h-full">TAP</Button>
                </ControlGroup>
            </div>

            {/* --- RIGHT GROUP: SEQUENCER & MODE --- */}
            <div className="flex items-center gap-4">
                 {isAnalyzing ? (
                    <div className="flex items-center gap-3 text-sm text-pos-yellow font-semibold">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-pos-yellow transition-all" style={{ width: `${progress}%` }} /></div>
                        <Button onClick={cancelFullAnalysis} variant="danger" size="xs"><FontAwesomeIcon icon={faTimes} /></Button>
                    </div>
                 ) : (
                    <Button variant="primary" size="sm" disabled={true} title="Analyze video frames (future feature)"><FontAwesomeIcon icon={faMicrochip} className="mr-2" />Analyze</Button>
                 )}
                <BarDisplay />
                <ControlGroup>
                    <Tooltip content="Copy Pose Data"><Button onClick={() => copyPose(currentEditingBar, activeBeatIndex)} variant="secondary"><FontAwesomeIcon icon={faCopy} /></Button></Tooltip>
                    <Tooltip content="Paste Pose Data"><Button onClick={() => pastePose(currentEditingBar, activeBeatIndex)} disabled={!copiedPoseData} variant="secondary"><FontAwesomeIcon icon={faPaste} /></Button></Tooltip>
                </ControlGroup>
                <SoundBank soundKits={soundKitsObject} selectedKitName={selectedKitName} onKitSelect={setSelectedKitName} currentSoundInKit={currentSoundInBank} onSoundInKitSelect={setCurrentSoundInBank} />
                <ControlGroup>
                    <Button onClick={() => setViewMode(MODES.POS)} variant={viewMode === MODES.POS ? 'custom' : 'secondary'} className={`!px-4 h-8 ${viewMode === MODES.POS && '!bg-pos-yellow !text-black font-semibold'}`}>POS</Button>
                    <Button onClick={() => setViewMode(MODES.SEQ)} variant={viewMode === MODES.SEQ ? "custom" : "secondary"} className={`!px-4 h-8 ${viewMode === MODES.SEQ && '!bg-brand-seq !text-white font-semibold'}`}>SEQ</Button>
                </ControlGroup>
            </div>
        </header>
    );
};

export default StudioHeader;