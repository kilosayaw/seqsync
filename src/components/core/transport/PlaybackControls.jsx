import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStop, faRecordVinyl, faUndo, faRedo, faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';

// COMMON & CORE COMPONENTS
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import TimecodeDisplay from './TimecodeDisplay';
import BarDisplay from './BarDisplay';

// CONTEXTS
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';

const ControlGroup = ({ children, className }) => <div className={`flex items-center gap-1.5 bg-black/20 p-1 rounded-md ${className}`}>{children}</div>;

const PlaybackControls = () => {
  // --- This component now sources everything from contexts ---
  // --- DEFINITIVE FIX: Added `handleStop` back to the destructuring ---
  const { isPlaying, isRecording, handlePlayPause, handleRecord, handleStop } = usePlayback();
  const { bpm, setBpm, handleTapTempo, handleUndo, handleRedo, history, historyIndex } = useSequence();
  const { copyPose, pastePose, copiedPoseData, currentEditingBar, activeBeatIndex } = useUIState();

  // --- DEFINITIVE FIX: Use the ref's current value for accurate boolean check ---
  const canUndo = historyIndex.current > 0;
  const canRedo = history.current.length > 1 && historyIndex.current < history.current.length - 1;

  return (
    <div className="w-full bg-gray-800/60 rounded-lg px-2 py-1 flex items-center justify-between gap-3 flex-wrap">
        <ControlGroup>
            <Tooltip content="Undo (Ctrl+Z)"><Button onClick={handleUndo} disabled={!canUndo} size="sm" variant="secondary"><FontAwesomeIcon icon={faUndo} /></Button></Tooltip>
            <Tooltip content="Redo (Ctrl+Y)"><Button onClick={handleRedo} disabled={!canRedo} size="sm" variant="secondary"><FontAwesomeIcon icon={faRedo} /></Button></Tooltip>
        </ControlGroup>
        
        <ControlGroup>
            <Tooltip content="Record Arm/Disarm"><Button onClick={handleRecord} size="lg" variant={isRecording ? 'danger' : 'secondary'}><FontAwesomeIcon icon={faRecordVinyl} className={isRecording ? 'animate-pulse' : ''}/></Button></Tooltip>
            <Tooltip content="Play/Pause (Spacebar)"><Button onClick={handlePlayPause} size="lg" variant="primary"><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></Button></Tooltip>
            <Tooltip content="Stop (Enter)"><Button onClick={handleStop} size="lg" variant="secondary"><FontAwesomeIcon icon={faStop} /></Button></Tooltip>
        </ControlGroup>
      
        <TimecodeDisplay />

        <ControlGroup>
            <div className="flex flex-col items-center">
                <input type="number" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value, 10))} className="w-20 bg-gray-900 text-center rounded p-1 text-2xl font-bold" />
            </div>
            <Button onClick={handleTapTempo} size="sm" variant="secondary" className="h-full">TAP</Button>
        </ControlGroup>
      
        <ControlGroup>
            <BarDisplay />
        </ControlGroup>
        
        <ControlGroup>
            <Tooltip content="Copy Pose Data"><Button onClick={() => copyPose(currentEditingBar, activeBeatIndex)} variant="secondary"><FontAwesomeIcon icon={faCopy} /></Button></Tooltip>
            <Tooltip content="Paste Pose Data"><Button onClick={() => pastePose(currentEditingBar, activeBeatIndex)} disabled={!copiedPoseData} variant="secondary"><FontAwesomeIcon icon={faPaste} /></Button></Tooltip>
        </ControlGroup>
    </div>
  );
};

export default PlaybackControls;