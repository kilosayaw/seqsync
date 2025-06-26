import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStop, faStepBackward, faStepForward,
  faRecordVinyl, 
  faUndoAlt, faRedoAlt, 
  faPlus, faMinus, faKeyboard, faCrosshairs, faCopy, faPaste,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Tooltip from '../../common/Tooltip';
import { 
    BPM_MIN, BPM_MAX, MODE_SYNC, 
    DEFAULT_TIME_SIGNATURE
} from '../../../utils/constants';

const BEATS_PER_BAR_OPTIONS = [
  { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, 
  { value: "5", label: "5" }, { value: "6", label: "6" }, { value: "7", label: "7" }, 
  { value: "8", label: "8" }, { value: "12", label: "12" }, { value: "16", label: "16" },
];
const BEAT_UNIT_OPTIONS = [
  { value: "2", label: "/2" }, { value: "4", label: "/4" }, 
  { value: "8", label: "/8" }, { value: "16", label: "/16" }
];
const SKIP_OPTIONS = [
  { value: "64", label: "1/64" }, { value: "32", label: "1/32" }, { value: "16", label: "1/16" },
  { value: "8", label: "1/8" }, { value: "4", label: "1/4" },   { value: "2", label: "1/2" },
  { value: "1", label: "Bar" }
];

const DigitBox = ({ value, label, small = false, largeFont = false, className = "" }) => (
  <div className={`flex flex-col items-center ${small ? 'mx-px sm:mx-0.5' : 'mx-0.5 sm:mx-1'} ${className}`}>
    <div
      className={`font-digital-play text-green-400 bg-black/70 border border-green-800/50 rounded-md shadow-inner flex items-center justify-center
                  ${largeFont
                    ? 'w-9 h-11 sm:w-10 sm:h-12 text-2xl sm:text-3xl px-0.5'
                    : small
                        ? 'w-4 h-6 sm:w-5 sm:h-7 text-base sm:text-lg px-0.5'
                        : 'w-7 h-9 sm:w-8 sm:h-10 text-xl sm:text-2xl px-1'}`}
      title={label ? `${label}: ${String(value)}` : String(value)}
    >
      {String(value)}
    </div>
    {label && <span className={`text-xxs text-gray-500 mt-0.5 uppercase tracking-wider ${largeFont ? 'invisible' : ''}`}>{label}</span>}
  </div>
);

DigitBox.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string,
  small: PropTypes.bool,
  largeFont: PropTypes.bool,
  className: PropTypes.string,
};

const PlaybackControls = ({
  bpm, onBpmChange, onTapTempo,
  isPlaying, onPlayPause, onStop,
  currentBar, currentBeatInBar,
  skipIntervalDenominator, onSkipIntervalChange,
  mainTimecodeParts,
  currentSongBar, totalBars,
  onNextBar, onPrevBar, onAddBar, onRemoveBar, onClearBar,
  isLooping, onToggleLoop, onSetLoopStart, onSetLoopEnd,
  isShiftActive, onToggleShift,
  appMode, mediaSrc, mediaOriginalBPM, onMediaOriginalBPMChange,
  onDetectMediaBPM, onSetDetectedBPMAsMaster, isDetectingBPM,
  timeSignature, onTimeSignatureChange,
  onCopyBar, onPasteBar, canPaste,
  onSkipForward, onSkipBackward,
  logToConsole,
}) => {

  const safeTimeSignature = timeSignature || DEFAULT_TIME_SIGNATURE;
  const { mm = '00', ss = '00', cs = '00' } = mainTimecodeParts || {};
  const transportButtonClass = "!p-0 !w-9 !h-9 sm:!w-10 sm:!h-10 !text-sm sm:!text-base flex items-center justify-center";
  const mainPlayPauseButtonClass = `${transportButtonClass} !w-11 !h-11 sm:!w-12 sm:!h-12 text-lg sm:text-xl`;
  const smallIconButtonClass = "!p-1 sm:!p-1.5 text-xs h-6 sm:h-7";

  return (
    <div className="flex flex-col xl:flex-row items-center xl:items-stretch justify-between gap-2 sm:gap-3 p-1.5 sm:p-2 bg-gray-800/70 rounded-lg shadow-transport w-full">
      
      <div className="flex flex-col items-center sm:flex-row sm:items-start xl:items-start gap-2 sm:gap-3 p-1.5 sm:p-2 bg-gray-900/40 rounded-md w-full xl:w-auto order-1 xl:order-none">
        <div className="flex flex-col space-y-1.5 items-center sm:items-start">
          <div className="flex items-center gap-1.5">
            <label htmlFor="bpm-input-main" className="text-gray-300 font-medium text-xs sm:text-sm">BPM</label>
            <Input id="bpm-input-main" type="number" value={String(bpm)} onChange={(e) => onBpmChange(e.target.value)} min={BPM_MIN} max={BPM_MAX} inputClassName="w-14 sm:w-16 text-center font-digital-play text-base sm:text-lg !p-1 h-7 sm:h-8" title={`Master Sequencer BPM (${BPM_MIN}-${BPM_MAX})`}/>
            <Button onClick={onTapTempo} variant="secondary" size="custom" className="h-7 sm:h-8 px-2 text-xs" title="Tap Tempo">TAP</Button>
          </div>
          <Tooltip content={`Shift Key is ${isShiftActive ? 'ON' : 'OFF'} (Ctrl/Cmd+K)`} wrapperElementType="span">
            <Button onClick={onToggleShift} variant="custom" className={`p-1 rounded-md text-xxs flex items-center gap-1 transition-colors w-full max-w-[90px] justify-center h-7 sm:h-8 ${isShiftActive ? 'bg-brand-accent text-black font-bold ring-1 ring-yellow-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} >
              <FontAwesomeIcon icon={faKeyboard} className="text-xs sm:text-sm"/><span>SHIFT</span>
            </Button>
          </Tooltip>
        </div>
        <div className="flex flex-col space-y-1.5 items-center sm:items-start">
          <div className="flex items-center gap-1.5">
            <label className="text-gray-300 text-xs sm:text-sm whitespace-nowrap">TIME SIG:</label>
            <Select id="beats-per-bar-select" value={String(safeTimeSignature.beatsPerBar)} onChange={(e) => onTimeSignatureChange({ ...safeTimeSignature, beatsPerBar: parseInt(e.target.value, 10) })} options={BEATS_PER_BAR_OPTIONS} selectClassName="!py-0.5 !text-xxs !h-7 sm:!h-8 !w-11 sm:!w-12 bg-gray-700 border-gray-600 font-digital-play" title="Beats per Bar"/>
            <Select id="beat-unit-select" value={String(safeTimeSignature.beatUnit)} onChange={(e) => onTimeSignatureChange({ ...safeTimeSignature, beatUnit: parseInt(e.target.value, 10) })} options={BEAT_UNIT_OPTIONS} selectClassName="!py-0.5 !text-xxs !h-7 sm:!h-8 !w-14 sm:!w-16 bg-gray-700 border-gray-600 font-digital-play" title="Beat Unit"/>
          </div>
           <div className="flex items-center gap-1.5 w-full justify-center sm:justify-start">
            <label htmlFor="skip-by-select" className="text-gray-300 text-xs sm:text-sm whitespace-nowrap">SKIP BY:</label>
            <Select id="skip-by-select" value={String(skipIntervalDenominator)} onChange={(e) => onSkipIntervalChange(e.target.value)} options={SKIP_OPTIONS} selectClassName="!py-0.5 !text-xxs !h-7 sm:!h-8 !w-[70px] sm:!w-20 bg-gray-700 border-gray-600 font-digital-play" title="Set Skip Interval"/>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-1 p-1 sm:p-1.5 bg-gray-900/40 rounded-md flex-grow w-full xl:w-auto order-2 xl:order-none shadow-inner">
        <div className="flex items-end justify-center gap-0.5 w-full">
          <DigitBox value={String(currentBar).padStart(2, '0')} label="BAR" className="self-end mb-px sm:mb-[3px]" />
          <div className="flex flex-col items-center mx-1 sm:mx-2">
            <div className="flex items-center gap-0.5 mx-auto" title={`Master Timecode: ${mm}:${ss}:${cs}`}>
              <DigitBox value={mm[0] || '0'} small /> <DigitBox value={mm[1] || '0'} small />
              <span className="font-digital-play text-base sm:text-lg text-green-400/80 mx-px sm:mx-0.5 relative bottom-px">:</span>
              <DigitBox value={ss[0] || '0'} small /> <DigitBox value={ss[1] || '0'} small />
              <span className="font-digital-play text-base sm:text-lg text-green-400/80 mx-px sm:mx-0.5 relative bottom-px">:</span>
              <DigitBox value={cs[0] || '0'} small /> <DigitBox value={cs[1] || '0'} small />
            </div>
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 w-full mt-1 flex-wrap">
              <Tooltip content="Set Loop Start (Shift+[)" wrapperElementType="span"><Button onClick={onSetLoopStart} variant="icon" className={`${transportButtonClass}`}><FontAwesomeIcon icon={faUndoAlt} /></Button></Tooltip>
              <Tooltip content={`Skip Backward (${SKIP_OPTIONS.find(o=>o.value === String(skipIntervalDenominator))?.label}) (←)`} wrapperElementType="span"><Button onClick={onSkipBackward} variant="icon" className={`${transportButtonClass}`}><FontAwesomeIcon icon={faStepBackward} /></Button></Tooltip>
              <Tooltip content={isPlaying ? "Pause (Space)" : "Play (Space)"} wrapperElementType="span"><Button onClick={onPlayPause} variant={isPlaying ? "danger" : "success"} size="custom" className={mainPlayPauseButtonClass}><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></Button></Tooltip>
              <Tooltip content="Stop & Reset (Ctrl+Enter)" wrapperElementType="span"><Button onClick={onStop} variant="secondary" size="custom" className={transportButtonClass}><FontAwesomeIcon icon={faStop} /></Button></Tooltip>
              <Tooltip content={`Loop ${isLooping ? 'ON' : 'OFF'} (L)`} wrapperElementType="span"><Button onClick={onToggleLoop} variant="icon" className={`${transportButtonClass} ${isLooping ? 'text-brand-accent ring-1 ring-brand-accent/50' : ''}`}><FontAwesomeIcon icon={faRecordVinyl} /></Button></Tooltip>
              <Tooltip content={`Skip Forward (${SKIP_OPTIONS.find(o=>o.value === String(skipIntervalDenominator))?.label}) (→)`} wrapperElementType="span"><Button onClick={onSkipForward} variant="icon" className={`${transportButtonClass}`}><FontAwesomeIcon icon={faStepForward} /></Button></Tooltip>
              <Tooltip content="Set Loop End (Shift+])" wrapperElementType="span"><Button onClick={onSetLoopEnd} variant="icon" className={`${transportButtonClass}`}><FontAwesomeIcon icon={faRedoAlt} /></Button></Tooltip>
            </div>
          </div>
          <DigitBox value={String(currentBeatInBar).padStart(2, '0')} label="BEAT" className="self-end mb-px sm:mb-[3px]" />
        </div>
      </div>

      <div className="flex flex-col items-center sm:items-end gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-gray-900/40 rounded-md w-full xl:w-auto xl:min-w-[200px] order-3 xl:order-none">
        <div className="flex items-center gap-0.5 sm:gap-1 w-full justify-center sm:justify-end flex-wrap">
          <span className="text-gray-400 text-xs whitespace-nowrap mr-1">EDIT BAR:</span>
          <span className="font-digital-play text-sm text-gray-200 bg-black/40 px-1.5 py-0.5 rounded h-7 sm:h-8 flex items-center" title={`Current Editing Bar: ${currentSongBar} of ${totalBars}`}>
            {String(currentSongBar).padStart(2,'0')}/{String(totalBars).padStart(2,'0')}
          </span>
          <Tooltip content="Prev Editing Bar (Shift+←)" wrapperElementType="span"><Button onClick={onPrevBar} variant="icon" className={smallIconButtonClass}><FontAwesomeIcon icon={faMinus} /></Button></Tooltip>
          <Tooltip content="Next Editing Bar (Shift+→)" wrapperElementType="span"><Button onClick={onNextBar} variant="icon" className={smallIconButtonClass}><FontAwesomeIcon icon={faPlus} /></Button></Tooltip>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 w-full justify-center sm:justify-end flex-wrap mt-1">
            <Tooltip content="Add Bar (Shift+A)" wrapperElementType="span"><Button onClick={onAddBar} variant="icon" className={`${smallIconButtonClass} text-green-400 hover:text-green-300`}><FontAwesomeIcon icon={faPlus} /></Button></Tooltip>
            <Tooltip content={`Copy Bar ${currentSongBar}`} wrapperElementType="span"><Button onClick={() => onCopyBar(currentSongBar)} variant="icon" className={`${smallIconButtonClass} text-sky-400 hover:text-sky-300`}><FontAwesomeIcon icon={faCopy} /></Button></Tooltip>
            <Tooltip content={`Paste to Bar ${currentSongBar}`} wrapperElementType="span"><Button onClick={() => onPasteBar(currentSongBar)} variant="icon" className={`${smallIconButtonClass} text-sky-400 hover:text-sky-300`} disabled={!canPaste}><FontAwesomeIcon icon={faPaste} /></Button></Tooltip>
            <Tooltip content={`Clear Bar ${currentSongBar} (Shift+C)`} wrapperElementType="span"><Button onClick={() => onClearBar(currentSongBar)} variant="icon" className={`${smallIconButtonClass} text-orange-400 hover:text-orange-300`}><FontAwesomeIcon icon={faCrosshairs} /></Button></Tooltip>
            <Tooltip content={`Remove Bar ${currentSongBar} (Shift+Del)`} wrapperElementType="span"><Button onClick={() => onRemoveBar(currentSongBar)} variant="icon" className={`${smallIconButtonClass} text-red-400 hover:text-red-300`} disabled={totalBars <= 1}><FontAwesomeIcon icon={faMinus} /></Button></Tooltip>
        </div>
        {appMode === MODE_SYNC && mediaSrc && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 pt-1 border-t border-gray-700/50 w-full justify-center sm:justify-end">
            <label htmlFor="media-original-bpm-input" className="text-gray-300 text-xxs sm:text-xs whitespace-nowrap">Media BPM:</label>
            <Input
              id="media-original-bpm-input" type="number" value={mediaOriginalBPM || ''}
              onChange={(e) => onMediaOriginalBPMChange(e.target.value)}
              min={BPM_MIN} max={BPM_MAX}
              inputClassName="w-14 sm:w-16 text-center font-digital-play text-xs sm:text-sm !p-0.5 sm:!p-1 h-6 sm:h-7"
              placeholder="N/A"
              title="Original BPM of loaded media. Sequencer syncs to this if set."
            />
            <Button onClick={onDetectMediaBPM} variant="secondary" size="custom" className="h-6 sm:h-7 px-1.5 sm:px-2 text-xxs sm:text-xs" disabled={isDetectingBPM || !mediaSrc} title="Detect BPM" iconLeft={isDetectingBPM ? faSpinner : null} iconProps={isDetectingBPM ? { spin: true } : {}} >{isDetectingBPM ? '' : 'Detect'}</Button>
            {mediaOriginalBPM && String(bpm) !== String(mediaOriginalBPM) && (
              <Button onClick={onSetDetectedBPMAsMaster} variant="primary" size="custom" className="h-6 sm:h-7 px-1.5 sm:px-2 text-xxs sm:text-xs !bg-brand-accent/80 hover:!bg-brand-accent" title="Set Media BPM as Master">Set Master</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

PlaybackControls.propTypes = {
  bpm: PropTypes.number.isRequired, onBpmChange: PropTypes.func.isRequired, onTapTempo: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired, onPlayPause: PropTypes.func.isRequired, onStop: PropTypes.func.isRequired,
  currentBar: PropTypes.number.isRequired, currentBeatInBar: PropTypes.number.isRequired,
  skipIntervalDenominator: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSkipIntervalChange: PropTypes.func.isRequired,
  mainTimecodeParts: PropTypes.shape({ mm: PropTypes.string, ss: PropTypes.string, cs: PropTypes.string }).isRequired,
  currentSongBar: PropTypes.number.isRequired, totalBars: PropTypes.number.isRequired,
  onNextBar: PropTypes.func.isRequired, onPrevBar: PropTypes.func.isRequired, onAddBar: PropTypes.func.isRequired,
  onRemoveBar: PropTypes.func.isRequired, onClearBar: PropTypes.func.isRequired,
  isLooping: PropTypes.bool.isRequired, onToggleLoop: PropTypes.func.isRequired,
  onSetLoopStart: PropTypes.func.isRequired, onSetLoopEnd: PropTypes.func.isRequired,
  isShiftActive: PropTypes.bool.isRequired, onToggleShift: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired, mediaSrc: PropTypes.string,
  mediaOriginalBPM: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onMediaOriginalBPMChange: PropTypes.func.isRequired, onDetectMediaBPM: PropTypes.func.isRequired,
  onSetDetectedBPMAsMaster: PropTypes.func.isRequired, isDetectingBPM: PropTypes.bool,
  timeSignature: PropTypes.shape({ beatsPerBar: PropTypes.number, beatUnit: PropTypes.number }),
  onTimeSignatureChange: PropTypes.func.isRequired,
  onCopyBar: PropTypes.func.isRequired, onPasteBar: PropTypes.func.isRequired, canPaste: PropTypes.bool,
  onSkipForward: PropTypes.func.isRequired, onSkipBackward: PropTypes.func.isRequired,
  logToConsole: PropTypes.func,
};

export default PlaybackControls;