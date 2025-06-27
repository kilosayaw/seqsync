import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStop, faStepBackward, faStepForward,
  faRecordVinyl, faUndoAlt, faRedoAlt, faPlus, faMinus, 
  faKeyboard, faCrosshairs, faCopy, faPaste, faUndo, faRedo
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { 
    DEFAULT_BPM,
    BPM_MIN, BPM_MAX,
    DEFAULT_TIME_SIGNATURE,
    SKIP_OPTIONS,
} from '../../../utils/constants';

const BEATS_PER_BAR_OPTIONS = [ { value: "4", label: "4" }, { value: "8", label: "8" } ];
const BEAT_UNIT_OPTIONS = [ { value: "4", label: "/4" }, { value: "8", label: "/8" } ];

const DigitBox = ({ value, label }) => (
  <div className="flex flex-col items-center mx-1">
    <div className="font-digital-play text-2xl text-green-400 bg-black/70 border border-green-800/50 rounded-md shadow-inner w-8 h-10 flex items-center justify-center">
      {String(value).padStart(2, '0')}
    </div>
    {label && <span className="text-xxs text-gray-500 mt-0.5 uppercase tracking-wider">{label}</span>}
  </div>
);
DigitBox.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, label: PropTypes.string };

const PlaybackControls = ({
  bpm = DEFAULT_BPM,
  onBpmChange,
  isPlaying = false,
  onPlayPause,
  onStop,
  currentBar = 0,
  currentBeat = 0,
  totalBars = 4,
  onNextBar,
  onPrevBar,
  onAddBar,
  onRemoveBar,
  onClearBar,
  mainTimecodeParts = { mm: '00', ss: '00', cs: '00' },
  isLooping = false,
  onToggleLoop,
  onSetLoopStart,
  onSetLoopEnd,
  isShiftActive = false,
  onToggleShift,
  skipIntervalDenominator = "16",
  onSkipIntervalChange,
  onSkipForward,
  onSkipBackward,
  timeSignature,
  onTimeSignatureChange,
  onCopyBar,
  onPasteBar,
  canPaste = false,
  onCopyPose,
  onPastePose,
  canPastePose = false,
  onTapTempo,
  onUndo, // [NEW] Prop for undo handler
  onRedo, // [NEW] Prop for redo handler
  canUndo, // [NEW] Prop to enable/disable undo button
  canRedo, // [NEW] Prop to enable/disable redo button
}) => {
  const safeTimeSignature = timeSignature || DEFAULT_TIME_SIGNATURE;
  const { mm = '00', ss = '00', cs = '00' } = mainTimecodeParts;
  const transportButtonClass = "!p-0 !w-10 !h-10 text-base flex items-center justify-center";
  const mainPlayPauseButtonClass = `${transportButtonClass} !w-12 !h-12 text-xl`;
  const smallIconButtonClass = "!p-1.5 text-xs h-7";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-gray-800/70 rounded-lg shadow-transport w-full">
      <div className="flex items-center gap-3">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="bpm-input-main" className="text-gray-300 font-medium text-sm">BPM</label>
            <Input id="bpm-input-main" type="number" value={String(bpm)} onChange={onBpmChange} min={BPM_MIN} max={BPM_MAX} inputClassName="w-16 text-center font-digital-play text-lg !p-1 h-8" />
            <Button onClick={onTapTempo} variant="secondary" size="custom" className="h-8 px-2 text-xs">TAP</Button>
          </div>
          <Button onClick={onToggleShift} variant="custom" className={`p-1 rounded-md text-xs flex items-center gap-1.5 transition-colors w-full justify-center h-8 ${isShiftActive ? 'bg-brand-accent text-black font-bold' : 'bg-gray-700 text-gray-300'}`}>
            <FontAwesomeIcon icon={faKeyboard} /><span>SHIFT</span>
          </Button>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <label className="text-gray-300 text-sm">TIME SIG:</label>
            <Select value={String(safeTimeSignature.beatsPerBar)} onChange={(e) => onTimeSignatureChange({ ...safeTimeSignature, beatsPerBar: parseInt(e.target.value)})} options={BEATS_PER_BAR_OPTIONS} selectClassName="!py-0 !h-8 w-12" />
            <Select value={String(safeTimeSignature.beatUnit)} onChange={(e) => onTimeSignatureChange({ ...safeTimeSignature, beatUnit: parseInt(e.target.value)})} options={BEAT_UNIT_OPTIONS} selectClassName="!py-0 !h-8 w-16" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-gray-300 text-sm">SKIP BY:</label>
            <Select value={String(skipIntervalDenominator)} onChange={(e) => onSkipIntervalChange(e.target.value)} options={SKIP_OPTIONS} selectClassName="!py-0 !h-8 w-20" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DigitBox value={currentBar + 1} label="BAR" />
        <DigitBox value={currentBeat + 1} label="BEAT" />
        <div className="flex flex-col items-center">
            <div className="flex items-center">
                <DigitBox value={mm[0]} /><DigitBox value={mm[1]} />
                <span className="font-digital-play text-xl text-green-400/80 mx-0.5">:</span>
                <DigitBox value={ss[0]} /><DigitBox value={ss[1]} />
                <span className="font-digital-play text-xl text-green-400/80 mx-0.5">:</span>
                <DigitBox value={cs[0]} /><DigitBox value={cs[1]} />
            </div>
            <div className="flex items-center gap-1 mt-1">
                <Button onClick={onSetLoopStart} variant="icon" className={transportButtonClass} title="Set Loop Start"><FontAwesomeIcon icon={faUndoAlt} /></Button>
                <Button onClick={onSkipBackward} variant="icon" className={transportButtonClass} title="Skip Backward"><FontAwesomeIcon icon={faStepBackward} /></Button>
                <Button onClick={onPlayPause} variant={isPlaying ? "danger" : "success"} size="custom" className={mainPlayPauseButtonClass} title={isPlaying ? "Pause" : "Play"}><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></Button>
                <Button onClick={onStop} variant="secondary" size="custom" className={transportButtonClass} title="Stop"><FontAwesomeIcon icon={faStop} /></Button>
                <Button onClick={onToggleLoop} variant="icon" className={`${transportButtonClass} ${isLooping ? 'text-brand-accent' : ''}`} title="Toggle Loop"><FontAwesomeIcon icon={faRecordVinyl} /></Button>
                <Button onClick={onSkipForward} variant="icon" className={transportButtonClass} title="Skip Forward"><FontAwesomeIcon icon={faStepForward} /></Button>
                <Button onClick={onSetLoopEnd} variant="icon" className={transportButtonClass} title="Set Loop End"><FontAwesomeIcon icon={faRedoAlt} /></Button>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">EDIT BAR:</span>
                <span className="font-digital-play text-sm text-gray-200 bg-black/40 px-1.5 py-0.5 rounded">{`${String(currentBar + 1).padStart(2,'0')}/${String(totalBars).padStart(2,'0')}`}</span>
                <Button onClick={onPrevBar} variant="icon" className={smallIconButtonClass}><FontAwesomeIcon icon={faMinus} /></Button>
                <Button onClick={onNextBar} variant="icon" className={smallIconButtonClass}><FontAwesomeIcon icon={faPlus} /></Button>
            </div>
            <div className="flex items-center gap-1">
                <Button onClick={onUndo} variant="icon" className={`${smallIconButtonClass} text-yellow-400`} disabled={!canUndo} title="Undo (Ctrl+Z)"><FontAwesomeIcon icon={faUndo} /></Button>
                <Button onClick={onRedo} variant="icon" className={`${smallIconButtonClass} text-yellow-400`} disabled={!canRedo} title="Redo (Ctrl+Y)"><FontAwesomeIcon icon={faRedo} /></Button>
                <div className="w-px h-4 bg-gray-600 mx-1"></div>
                <Button onClick={onAddBar} variant="icon" className={`${smallIconButtonClass} text-green-400`}><FontAwesomeIcon icon={faPlus} /></Button>
                <Button onClick={onCopyBar} variant="icon" className={`${smallIconButtonClass} text-sky-400`}><FontAwesomeIcon icon={faCopy} /></Button>
                <Button onClick={onPasteBar} variant="icon" className={`${smallIconButtonClass} text-sky-400`} disabled={!canPaste}><FontAwesomeIcon icon={faPaste} /></Button>
                <Button onClick={onCopyPose} variant="icon" className={`${smallIconButtonClass} text-purple-400`}><FontAwesomeIcon icon={faCopy} /> <span className="text-xxs">Pose</span></Button>
                <Button onClick={onPastePose} variant="icon" className={`${smallIconButtonClass} text-purple-400`} disabled={!canPastePose}><FontAwesomeIcon icon={faPaste} /> <span className="text-xxs">Pose</span></Button>
                <Button onClick={onClearBar} variant="icon" className={`${smallIconButtonClass} text-orange-400`}><FontAwesomeIcon icon={faCrosshairs} /></Button>
                <Button onClick={onRemoveBar} variant="icon" className={`${smallIconButtonClass} text-red-400`} disabled={totalBars <= 1}><FontAwesomeIcon icon={faMinus} /></Button>
            </div>
        </div>
      </div>
    </div>
  );
};

PlaybackControls.propTypes = {
  bpm: PropTypes.number,
  onBpmChange: PropTypes.func.isRequired,
  onTapTempo: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool,
  onPlayPause: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  currentBar: PropTypes.number,
  currentBeat: PropTypes.number,
  totalBars: PropTypes.number,
  onNextBar: PropTypes.func.isRequired,
  onPrevBar: PropTypes.func.isRequired,
  onAddBar: PropTypes.func.isRequired,
  onRemoveBar: PropTypes.func.isRequired,
  onClearBar: PropTypes.func.isRequired,
  mainTimecodeParts: PropTypes.object,
  isLooping: PropTypes.bool,
  onToggleLoop: PropTypes.func.isRequired,
  onSetLoopStart: PropTypes.func.isRequired,
  onSetLoopEnd: PropTypes.func.isRequired,
  isShiftActive: PropTypes.bool,
  onToggleShift: PropTypes.func.isRequired,
  skipIntervalDenominator: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSkipIntervalChange: PropTypes.func.isRequired,
  onSkipForward: PropTypes.func.isRequired,
  onSkipBackward: PropTypes.func.isRequired,
  timeSignature: PropTypes.object,
  onTimeSignatureChange: PropTypes.func.isRequired,
  onCopyBar: PropTypes.func.isRequired,
  onPasteBar: PropTypes.func.isRequired,
  canPaste: PropTypes.bool,
  onCopyPose: PropTypes.func.isRequired,
  onPastePose: PropTypes.func.isRequired,
  canPastePose: PropTypes.bool,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
};

export default PlaybackControls;