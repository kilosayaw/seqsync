import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import Select from '../../common/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faRedo, faSync, faPlay, faPause, faStop, faStepBackward, faStepForward, faMinus, faPlus, faTrash, faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';
import { SKIP_OPTIONS } from '../../../utils/constants';

const PlaybackControls = ({ onUndo, onRedo, canUndo, canRedo, onPlayPause, isPlaying, onStop, onTapTempo, onAddBar, onRemoveBar, onClearBar, onNextBar, onPrevBar, onCopyBar, onPasteBar, canPaste, onCopyPose, onPastePose, canPastePose, onSkipForward, onSkipBackward, onSkipIntervalChange, }) => {
  const skipOptionsWithLabels = useMemo(() => SKIP_OPTIONS.map(opt => ({ value: opt.value, label: opt.value === '1' ? 'Bar' : `1/${opt.value}` })), []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-2 bg-gray-800/80 rounded-lg shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button onClick={onUndo} disabled={!canUndo} variant="secondary" title="Undo (Ctrl+Z)" iconLeft={faUndo} />
        <Button onClick={onRedo} disabled={!canRedo} variant="secondary" title="Redo (Ctrl+Y)" iconLeft={faRedo} />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onTapTempo} variant="primary" className="!bg-purple-600 hover:!bg-purple-700" title="Tap Tempo" iconLeft={faSync} />
        <Button onClick={onPlayPause} variant="primary" className={isPlaying ? "!bg-yellow-500" : "!bg-green-500"} iconLeft={isPlaying ? faPause : faPlay} />
        <Button onClick={onStop} variant="danger" iconLeft={faStop} />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onSkipBackward} title="Skip Backward" iconLeft={faStepBackward} />
        <Select options={skipOptionsWithLabels} defaultValue="16" onChange={(e) => onSkipIntervalChange(e.target.value)} className="w-20 text-center" />
        <Button onClick={onSkipForward} title="Skip Forward" iconLeft={faStepForward} />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onPrevBar} title="Previous Bar" iconLeft={faMinus}>Bar</Button>
        <Button onClick={onNextBar} title="Next Bar" iconLeft={faPlus}>Bar</Button>
        <Button onClick={onClearBar} variant="secondary" title="Clear Bar" iconLeft={faTrash} />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onCopyBar} variant="secondary" title="Copy Bar" iconLeft={faCopy}>Bar</Button>
        <Button onClick={onPasteBar} disabled={!canPaste} variant="secondary" title="Paste Bar" iconLeft={faPaste}>Bar</Button>
        <Button onClick={onCopyPose} variant="secondary" title="Copy Pose" iconLeft={faCopy}>Pose</Button>
        <Button onClick={onPastePose} disabled={!canPastePose} variant="secondary" title="Paste Pose" iconLeft={faPaste}>Pose</Button>
      </div>
    </div>
  );
};

PlaybackControls.propTypes = {
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onStop: PropTypes.func.isRequired,
  onTapTempo: PropTypes.func.isRequired,
  onNextBar: PropTypes.func.isRequired,
  onPrevBar: PropTypes.func.isRequired,
  onAddBar: PropTypes.func.isRequired,
  onRemoveBar: PropTypes.func.isRequired,
  onClearBar: PropTypes.func.isRequired,
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