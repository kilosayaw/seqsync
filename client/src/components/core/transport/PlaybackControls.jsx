import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Direct, explicit icon imports
import {
  faPlay, faPause, faStop, faPlus, faMinus, faTrash, faCopy, faPaste,
  faStepBackward, faStepForward, faUndo, faRedo, faMicrochip,
  faFastBackward, faFastForward
} from '@fortawesome/free-solid-svg-icons';

import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import Select from '../../common/Select';
import { SKIP_OPTIONS } from '../../../utils/constants';

const PlaybackControls = ({
  isPlaying, onPlayPause, isRecording, onRecord, onStop, onTapTempo,
  onAddBar, onRemoveBar, onClearBar, onNextBar, onPrevBar,
  onCopyBar, onPasteBar, canPaste,
  onCopyPose, onPastePose, canPastePose,
  onUndo, onRedo, canUndo, canRedo,
  onSkipForward, onSkipBackward, onSkipIntervalChange,
  bpm, onBpmChange
}) => {
  
  const skipOptionsFormatted = SKIP_OPTIONS.map(val => ({
    value: val,
    label: val === 1 ? '1/1 (Bar)' : `1/${val}`
  }));

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-2 flex items-center justify-between gap-4 flex-wrap">
      {/* Undo/Redo */}
      <div className="flex items-center gap-2">
        <Tooltip text="Undo (Ctrl+Z)">
          <Button onClick={onUndo} disabled={!canUndo} size="sm" variant="secondary"><FontAwesomeIcon icon={faUndo} /></Button>
        </Tooltip>
        <Tooltip text="Redo (Ctrl+Y)">
          <Button onClick={onRedo} disabled={!canRedo} size="sm" variant="secondary"><FontAwesomeIcon icon={faRedo} /></Button>
        </Tooltip>
      </div>

      {/* Main Transport */}
      <div className="flex items-center gap-2">
        <Tooltip text="Record (R)">
          <Button onClick={onRecord} size="sm" variant={isRecording ? 'danger' : 'secondary'} className="w-12">
            <FontAwesomeIcon icon={faMicrochip} className={isRecording ? 'animate-pulse' : ''}/>
          </Button>
        </Tooltip>
        <Tooltip text="Play/Pause (Spacebar)">
          <Button onClick={onPlayPause} size="sm" variant="primary" className="w-12">
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </Button>
        </Tooltip>
        <Tooltip text="Stop (Enter)">
          <Button onClick={onStop} size="sm" variant="secondary" className="w-12"><FontAwesomeIcon icon={faStop} /></Button>
        </Tooltip>
      </div>
      
      {/* Tempo */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
            <input type="number" value={bpm} onChange={onBpmChange} className="w-16 bg-gray-900 text-center rounded p-1 text-lg font-bold" />
            <label className="text-xs text-gray-400">BPM</label>
        </div>
        <Button onClick={onTapTempo} size="sm" variant="secondary">TAP</Button>
      </div>

      {/* Bar Navigation */}
      <div className="flex items-center gap-2">
        <Button onClick={onPrevBar} variant="secondary"><FontAwesomeIcon icon={faStepBackward} /></Button>
        <span className="font-mono text-lg">BAR</span>
        <Button onClick={onNextBar} variant="secondary"><FontAwesomeIcon icon={faStepForward} /></Button>
        {/* CORRECTED: Using valid variants */}
        <Button onClick={onAddBar} variant="secondary"><FontAwesomeIcon icon={faPlus} /></Button>
        <Button onClick={onRemoveBar} variant="secondary"><FontAwesomeIcon icon={faMinus} /></Button>
        <Button onClick={onClearBar} variant="danger"><FontAwesomeIcon icon={faTrash} /></Button>
      </div>

      {/* Copy/Paste */}
      <div className="flex items-center gap-2">
        <Tooltip text="Copy Bar"><Button onClick={onCopyBar} variant="secondary"><FontAwesomeIcon icon={faCopy} /> Bar</Button></Tooltip>
        <Tooltip text="Paste Bar"><Button onClick={onPasteBar} disabled={!canPaste} variant="secondary"><FontAwesomeIcon icon={faPaste} /> Bar</Button></Tooltip>
      </div>

      {/* Skip Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={onSkipBackward} variant="secondary"><FontAwesomeIcon icon={faFastBackward} /></Button>
        <Select options={skipOptionsFormatted} onChange={e => onSkipIntervalChange(e.target.value)} className="w-28"/>
        <Button onClick={onSkipForward} variant="secondary"><FontAwesomeIcon icon={faFastForward} /></Button>
      </div>
    </div>
  );
};

// Re-enforce required props for good practice
PlaybackControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onStop: PropTypes.func.isRequired,
  onTapTempo: PropTypes.func.isRequired,
  onAddBar: PropTypes.func.isRequired,
  onRemoveBar: PropTypes.func.isRequired,
  onClearBar: PropTypes.func.isRequired,
  onNextBar: PropTypes.func.isRequired,
  onPrevBar: PropTypes.func.isRequired,
  onCopyBar: PropTypes.func.isRequired,
  onPasteBar: PropTypes.func.isRequired,
  canPaste: PropTypes.bool,
  onCopyPose: PropTypes.func.isRequired,
  onPastePose: PropTypes.func.isRequired,
  canPastePose: PropTypes.bool,
  onSkipForward: PropTypes.func.isRequired,
  onSkipBackward: PropTypes.func.isRequired,
  onSkipIntervalChange: PropTypes.func.isRequired,
};

export default PlaybackControls;