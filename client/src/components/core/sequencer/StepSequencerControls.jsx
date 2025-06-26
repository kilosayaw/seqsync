// src/components/core/sequencer/StepSequencerControls.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import BeatButton from './BeatButton';
import SoundBank from './SoundBank';
import PlaybackControls from '../transport/PlaybackControls';
import PoseEditorModalComponent from '../pose_editor/PoseEditorModalComponent';
import SkeletalPoseVisualizer2D from '../pose_editor/SkeletalPoseVisualizer2D';
import SideJointSelector from '../pose_editor/SideJointSelector';
import { JointInputPanel } from '../pose_editor/JointInputPanel'; // Assuming it's exported as named
import FootDisplay from '../pose_editor/FootDisplay';
import FootJoystickOverlay from '../pose_editor/FootJoystickOverlay';
// import CoreDynamicsVisualizer from '../pose_editor/CoreDynamicsVisualizer'; // Uncomment if ready
import {
  BARS_PER_SEQUENCE, DEFAULT_BPM, MODES,
  KEYBOARD_LAYOUT_MODE_SEQ, KEYBOARD_MODE_SWITCH, KEYBOARD_TRANSPORT_CONTROLS,
  KEYBOARD_NAVIGATION_POS_MODE, KEYBOARD_JOINT_NUDGE_CONTROLS,
  INITIAL_SONG_DATA, DEFAULT_SOUND_KIT, AVAILABLE_KITS, POSE_DEFAULT_VECTOR,
  DEFAULT_NUM_BEATS_PER_BAR_CONST, BEATS_PER_ROW_DISPLAY,
  UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW, // For SideJointSelector if it doesn't use JOINT_SETS
  JOINT_SETS, // For SideJointSelector if it uses a combined list
  BPM_MIN, BPM_MAX, MODE_POS, MODE_SEQ, DEFAULT_TIME_SIGNATURE,
  createDefaultBeatObject,
  TAP_TEMPO_MAX_INTERVAL_MS, TAP_TEMPO_MIN_TAPS, MAX_SOUNDS_PER_BEAT,
  MAIN_FOOT_DISPLAY_SIZE_CLASSES,
  SKIP_OPTIONS // For PlaybackControls skip interval dropdown
} from '../../../utils/constants';
import * as audioManager from '../../../utils/audioManager';
import { generateNotationForBeat } from '../../../utils/notationUtils';
// import { ALL_JOINTS_MAP } from '../../../utils/sounds'; // Not directly used here, but used by children/utils
import { useAuth } from '../../../hooks/useAuth';
import { useSequencerSettings } from '../../../contexts/SequencerSettingsContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSave, faFolderOpen, faUpload, faCog } from '@fortawesome/free-solid-svg-icons'; // Added more icons

// --- Mock/Placeholder Components for Load/Save/Media (replace with actuals later) ---
const LoadSave = ({ onLoad, onSave, onSaveAs }) => (
  <div className="flex items-center gap-1">
    <Button onClick={onLoad} variant="icon" size="xs" title="Load Sequence (Ctrl+O)" className="!p-1.5"><FontAwesomeIcon icon={faFolderOpen}/></Button>
    <Button onClick={onSave} variant="icon" size="xs" title="Save Sequence (Ctrl+S)" className="!p-1.5"><FontAwesomeIcon icon={faSave}/></Button>
    {/* <Button onClick={onSaveAs} variant="icon" size="xs" title="Save As..." className="!p-1.5"><FontAwesomeIcon icon={faSave}/>+</Button> */}
  </div>
);
LoadSave.propTypes = { onLoad:() => {}, onSave:() => {}, onSaveAs:()=>{} }; // Add proper PropTypes

const FileUploader = ({ onMediaUpload }) => (
  <Button onClick={onMediaUpload} variant="icon" size="xs" title="Upload/Link Media" className="!p-1.5">
    <FontAwesomeIcon icon={faUpload}/> <span className="ml-1 text-xxs hidden sm:inline">Media</span>
  </Button>
);
FileUploader.propTypes = { onMediaUpload: () => {} }; // Add proper PropTypes

// Common Button (assuming this is your actual common button or a refined version)
const Button = ({ children, onClick, variant = "secondary", size = "sm", className = "", iconLeft, iconRight, disabled, title, ...props }) => (
    <button 
        onClick={onClick} 
        className={`py-1 px-2 rounded text-xs transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed
                    ${variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400' : 
                     variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-gray-400' : 
                     variant === 'icon' ? 'bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white focus:ring-gray-500' :
                     variant === 'dangerOutline' ? 'bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-white focus:ring-red-300' :
                     variant === 'success' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400' :
                     variant === 'custom' ? className : // Allows full custom styling via className if 'custom'
                     'bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-gray-400'}
                    ${size === 'xs' ? 'text-xs !py-0.5 !px-1.5' : size === 'sm' ? 'text-sm' : ''} 
                    ${className}`} // Allow overriding className
        disabled={disabled} 
        title={title}
        {...props}
    >
        {iconLeft && <FontAwesomeIcon icon={iconLeft} className="mr-1.5" />}
        {children}
        {iconRight && <FontAwesomeIcon icon={iconRight} className="ml-1.5" />}
    </button>
);
Button.propTypes = { children: PropTypes.node, onClick: PropTypes.func, variant: PropTypes.string, size: PropTypes.string, className: PropTypes.string, iconLeft: PropTypes.object, iconRight: PropTypes.object, disabled: PropTypes.bool, title: PropTypes.string };


// --- Main StepSequencerControls Component ---
const StepSequencerControls = () => {
  // SECTION 1: CONTEXTS
  const { user: currentUser } = useAuth() || {};
  const { bpm: contextBpm, setBpm: setContextBpm, timeSignature: contextTimeSignature, setTimeSignature: setContextTimeSignatureLocal } = useSequencerSettings();

  // SECTION 2: LOGGING FUNCTION
  const logDebug = useCallback((level, message, ...args) => {
    const prefix = `[SĒQsync|${level.toUpperCase()}|SSC]`;
    // console.log(prefix, message, ...args); // Uncomment for verbose logging
    if (level === 'error') console.error(prefix, message, ...args);
    else if (level === 'warn') console.warn(prefix, message, ...args);
    // else console.log(prefix, message, ...args); // Default to console.log for info/debug
  }, []);

  // SECTION 3: STATE HOOKS
  const [songData, setSongData] = useState(() => {
    logDebug('info', 'Initializing songData from INITIAL_SONG_DATA');
    return JSON.parse(JSON.stringify(INITIAL_SONG_DATA)); // Deep copy
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed for current playing beat within a bar
  const [currentBar, setCurrentBar] = useState(0);   // 0-indexed for current playing bar
  const [bpm, setBpm] = useState(contextBpm ?? DEFAULT_BPM);
  const [selectedKitName, setSelectedKitName] = useState(DEFAULT_SOUND_KIT.name);
  const [currentSoundInBank, setCurrentSoundInBank] = useState(null); // Stores the sound NAME/KEY (e.g. 'BD0000')
  const [viewMode, setViewMode] = useState(MODES.SEQ); // Default to SEQ mode
  const [activeBeatIndex, setActiveBeatIndex] = useState(0); // 0-indexed for UI selection / editing target beat
  const [currentEditingBar, setCurrentEditingBar] = useState(0); // 0-indexed for UI selection / editing target bar
  const [activeEditingJoint, setActiveEditingJoint] = useState(null); // Abbrev of the joint being actively edited
  const [isPoseEditorModalOpen, setIsPoseEditorModalOpen] = useState(false);
  const [isLoadingSounds, setIsLoadingSounds] = useState(true);
  const [errorLoadingSounds, setErrorLoadingSounds] = useState(null);
  const [showMainSkeletonLines, setShowMainSkeletonLines] = useState(true);
  const [notationText, setNotationText] = useState({ shorthand: "N/A", plainEnglish: "N/A", analysis: "N/A" });
  const [mainTimecodeParts, setMainTimecodeParts] = useState({ mm: '00', ss: '00', cs: '00' });
  const [skipIntervalDenominator, setSkipIntervalDenominator] = useState(16); // Default to 1/16 skip
  const [isShiftActive, setIsShiftActive] = useState(false); // For keyboard shortcuts
  const [isLooping, setIsLooping] = useState(false);
  const [loopStartPoint, setLoopStartPoint] = useState(null); // { bar: 0, beat: 0 }
  const [loopEndPoint, setLoopEndPoint] = useState(null);   // { bar: 0, beat: 15 }
  const [sequencerWasActive, setSequencerWasActive] = useState(false); // To track if play was pressed after stop
  const [mediaOriginalBPM, setMediaOriginalBPM] = useState(''); // For SYNC mode
  const [copiedBarData, setCopiedBarData] = useState(null); // For copy/paste bar

  // SECTION 4: REF HOOKS (for values in intervals/callbacks without causing re-renders/stale closures)
  const intervalRef = useRef(null);
  const currentStepRef = useRef(currentStep);
  const currentBarRef = useRef(currentBar);
  const songDataRef = useRef(songData);
  const tapTempoDataRef = useRef({ timestamps: [], timer: null });
  const isPlayingRef = useRef(isPlaying);
  const isLoopingRef = useRef(isLooping);
  const loopStartPointRef = useRef(loopStartPoint);
  const loopEndPointRef = useRef(loopEndPoint);
  const bpmRef = useRef(bpm);
  // const mediaInteractionRef = useRef(null); // For <audio> or <video> element in SYNC mode
  // const seqrFileInputRef = useRef(null); // For hidden file input for .seq load
  // const mediaFileInputRef = useRef(null); // For hidden file input for media load

  // SECTION 5: REF SYNCHRONIZATION EFFECTS (Keep refs in sync with state)
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { currentBarRef.current = currentBar; }, [currentBar]);
  useEffect(() => { songDataRef.current = songData; logDebug('debug', 'songDataRef updated'); }, [songData, logDebug]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { loopStartPointRef.current = loopStartPoint; }, [loopStartPoint]);
  useEffect(() => { loopEndPointRef.current = loopEndPoint; }, [loopEndPoint]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // SECTION 6: DERIVED STATE (useMemo)
  const musicalBeatsPerBar = useMemo(() => contextTimeSignature?.beatsPerBar || DEFAULT_TIME_SIGNATURE.beatsPerBar, [contextTimeSignature]);
  const totalBarsInSequence = useMemo(() => songData?.length || BARS_PER_SEQUENCE, [songData]);
  const uiPadsToRender = DEFAULT_NUM_BEATS_PER_BAR_CONST; // Always 16 pads for UI

  const currentBarForUI = useMemo(() => {
      const bar = songData[currentEditingBar];
      if (bar && bar.beats && bar.beats.length === uiPadsToRender) return bar;
      // Fallback or ensure bar has correct number of beats
      const defaultBeats = Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i));
      return bar ? { ...bar, beats: bar.beats.length === uiPadsToRender ? bar.beats : defaultBeats } : { id: currentEditingBar, beats: defaultBeats };
  }, [songData, currentEditingBar, uiPadsToRender]);
  const currentBarBeatsForUI = currentBarForUI.beats;

  const beatDataForActiveSelection = useMemo(() => { // For visualizers and main panel inputs
    if (activeBeatIndex === null || currentEditingBar === null) return createDefaultBeatObject(0);
    const barData = songData[currentEditingBar];
    return barData?.beats[activeBeatIndex] || createDefaultBeatObject(activeBeatIndex);
  }, [songData, activeBeatIndex, currentEditingBar]);

  const beatDataForModal = useMemo(() => { // For PoseEditorModal
    if (activeBeatIndex === null || currentEditingBar === null) return null;
    const barData = songData[currentEditingBar];
    if (!barData || !barData.beats[activeBeatIndex]) {
        return { ...createDefaultBeatObject(activeBeatIndex), barNumber: currentEditingBar, id: activeBeatIndex };
    }
    return { ...barData.beats[activeBeatIndex], barNumber: currentEditingBar, id: activeBeatIndex };
  }, [songData, activeBeatIndex, currentEditingBar]);
  
  const currentBarSongDataForModal = useMemo(() => { // Entire bar's data for modal mini-pads
    return songData[currentEditingBar]?.beats || Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i));
  }, [songData, currentEditingBar, uiPadsToRender]);

  const activeJointCurrentVector = useMemo(() => beatDataForActiveSelection.jointInfo?.[activeEditingJoint]?.vector || POSE_DEFAULT_VECTOR, [beatDataForActiveSelection, activeEditingJoint]);
  
  const currentSelectedKitObject = useMemo(() => {
      return AVAILABLE_KITS.find(k => k.name === selectedKitName) || DEFAULT_SOUND_KIT;
  }, [selectedKitName]);
  const currentSelectedKitSoundsArray = currentSelectedKitObject.sounds; // Array of {name, key, url}

  const leftAnkleKey = useMemo(() => (UI_LEFT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('A') || j.abbrev.includes('ANK')) || {abbrev: 'LA'}).abbrev, []);
  const rightAnkleKey = useMemo(() => (UI_RIGHT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('A') || j.abbrev.includes('ANK')) || {abbrev: 'RA'}).abbrev, []);
  
  const mainLeftAnkleRotation = useMemo(() => parseFloat(beatDataForActiveSelection.jointInfo?.[leftAnkleKey]?.rotation) || 0, [beatDataForActiveSelection.jointInfo, leftAnkleKey]);
  const mainRightAnkleRotation = useMemo(() => parseFloat(beatDataForActiveSelection.jointInfo?.[rightAnkleKey]?.rotation) || 0, [beatDataForActiveSelection.jointInfo, rightAnkleKey]);
  const mainLeftGrounding = useMemo(() => beatDataForActiveSelection.grounding?.L || null, [beatDataForActiveSelection.grounding]);
  const mainRightGrounding = useMemo(() => beatDataForActiveSelection.grounding?.R || null, [beatDataForActiveSelection.grounding]);

  // SECTION 7: UTILITY FUNCTIONS (useCallback for stability if passed as props)
  const makeDeepCopy = useCallback((data) => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      logDebug('error', 'Deep copy failed', error, data);
      return data; // Fallback, though risky
    }
  }, [logDebug]);
  
  // SECTION 8: CORE EVENT HANDLERS (useCallback for stability)
  // These are the "engine" functions that modify state.

  const coreHandlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlayingRef.current;
    logDebug('info', `PlayPause Clicked. Was playing: ${isPlayingRef.current}, Will be: ${newIsPlaying}`);
    if (newIsPlaying && !sequencerWasActive) {
      // If starting play from a stopped state, ensure playback starts from the UI-selected bar/beat
      const startBar = currentEditingBar;
      const startBeat = activeBeatIndex ?? 0;
      logDebug('info', `Playback STARTING from UI position: Bar ${startBar + 1}, Beat ${startBeat + 1}`);
      setCurrentBar(startBar);
      setCurrentStep(startBeat);
      currentBarRef.current = startBar; // Sync refs immediately
      currentStepRef.current = startBeat;
      setSequencerWasActive(true);
    }
    setIsPlaying(newIsPlaying);
  }, [sequencerWasActive, currentEditingBar, activeBeatIndex, setIsPlaying, setCurrentBar, setCurrentStep, setSequencerWasActive, logDebug]);

  const coreHandleStop = useCallback(() => {
    logDebug('info', 'Stop Clicked.');
    setIsPlaying(false);
    setSequencerWasActive(false); // Allow next play to start from UI position
    // Optionally reset to bar 1, beat 1, or stay at current UI edit position
    // Staying at current UI edit position seems more user-friendly
    const currentEditBar = currentEditingBar;
    const currentEditBeat = activeBeatIndex ?? 0;
    setCurrentBar(currentEditBar); // Sync playback cursor to UI edit cursor
    setCurrentStep(currentEditBeat);
    currentBarRef.current = currentEditBar;
    currentStepRef.current = currentEditBeat;
    setMainTimecodeParts({ mm: '00', ss: '00', cs: '00' }); // Reset timecode display
  }, [setIsPlaying, setCurrentStep, setCurrentBar, setSequencerWasActive, currentEditingBar, activeBeatIndex, logDebug]);

  const coreHandleBpmChange = useCallback((val) => {
    const parsedBpm = parseInt(val, 10);
    if (!isNaN(parsedBpm)) {
      const clampedBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, parsedBpm));
      setBpm(clampedBpm);
      if (setContextBpm) setContextBpm(clampedBpm);
      logDebug('info', `BPM changed to: ${clampedBpm}`);
    } else {
      logDebug('warn', `Invalid BPM input: ${val}`);
    }
  }, [setBpm, setContextBpm, logDebug]);

  const coreHandleAddSoundToBeat = useCallback((barIdx, beatIdx, soundNameOrKey) => {
    if (!soundNameOrKey) {
      logDebug('warn', 'AddSoundToBeat - No sound key provided.');
      return;
    }
    logDebug('info', `AddSoundToBeat attempt: Bar ${barIdx + 1}, Beat ${beatIdx + 1}, Sound: ${soundNameOrKey}`);
    setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      // Ensure bar and beat objects exist
      if (!newSongData[barIdx]) newSongData[barIdx] = { id: barIdx, beats: Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i)) };
      if (!newSongData[barIdx].beats[beatIdx]) newSongData[barIdx].beats[beatIdx] = createDefaultBeatObject(beatIdx);
      
      const beatSounds = newSongData[barIdx].beats[beatIdx].sounds || [];
      let modified = false;
      if (!beatSounds.includes(soundNameOrKey) && beatSounds.length < MAX_SOUNDS_PER_BEAT) {
        newSongData[barIdx].beats[beatIdx].sounds = [...beatSounds, soundNameOrKey];
        modified = true;
        logDebug('debug', `Sound '${soundNameOrKey}' ADDED to Bar ${barIdx + 1}, Beat ${beatIdx + 1}`);
      } else if (beatSounds.includes(soundNameOrKey)) {
        newSongData[barIdx].beats[beatIdx].sounds = beatSounds.filter(sKey => sKey !== soundNameOrKey);
        modified = true;
        logDebug('debug', `Sound '${soundNameOrKey}' REMOVED from Bar ${barIdx + 1}, Beat ${beatIdx + 1}`);
      } else {
        toast.warn(`Max ${MAX_SOUNDS_PER_BEAT} sounds per beat reached.`);
        logDebug('warn', `Max sounds reached for Bar ${barIdx + 1}, Beat ${beatIdx + 1}. Cannot add '${soundNameOrKey}'.`);
      }
      return modified ? newSongData : prevSongData;
    });
  }, [logDebug, makeDeepCopy, uiPadsToRender]); // uiPadsToRender needed if creating new bar/beat objects
  
  const coreHandleBeatClick = useCallback((barIdx, beatIdx) => {
    logDebug('info', `Beat Clicked: Bar ${barIdx + 1}, Beat ${beatIdx + 1}, Mode: ${viewMode}`);
    setCurrentEditingBar(barIdx); // Always update current editing bar
    setActiveBeatIndex(beatIdx);   // Always update selected beat index for UI

    if (viewMode === MODES.SEQ && currentSoundInBank?.name) { // currentSoundInBank is the NAME/KEY
        logDebug('debug', `SEQ Mode Beat Click: Programming sound '${currentSoundInBank.name}'`);
        coreHandleAddSoundToBeat(barIdx, beatIdx, currentSoundInBank.name);
        const soundObjToPlay = currentSelectedKitSoundsArray.find(s => s.name === currentSoundInBank.name);
        if (soundObjToPlay?.url && audioManager.playSound) {
            audioManager.playSound(soundObjToPlay.url);
            logDebug('debug', `Played armed sound '${soundObjToPlay.name}' on beat click.`);
        }
    } else if (viewMode === MODES.POS) {
        logDebug('debug', `POS Mode Beat Click: Opening Pose Editor Modal.`);
        setIsPoseEditorModalOpen(true);
    }
  }, [viewMode, currentSoundInBank, coreHandleAddSoundToBeat, currentSelectedKitSoundsArray, logDebug]);

  const coreHandleKitSelect = useCallback((kitName) => {
    const kit = AVAILABLE_KITS.find(x => x.name === kitName);
    if (kit) {
      setSelectedKitName(kit.name);
      setCurrentSoundInBank(null); // Reset selected sound when kit changes
      logDebug('info', `Kit selected: ${kit.displayName || kit.name}`);
    } else {
      logDebug('warn', `Kit not found: ${kitName}`);
    }
  }, [setSelectedKitName, setCurrentSoundInBank, logDebug]);

  const coreHandleSoundSelectedInBank = useCallback((soundNameOrKey) => { // soundNameOrKey is the unique 'name' like 'BD0000'
    setCurrentSoundInBank(soundNameOrKey);
    logDebug('info', `Sound selected in bank: ${soundNameOrKey} from kit ${selectedKitName}`);
  }, [setCurrentSoundInBank, selectedKitName, logDebug]);

  const coreHandleModeChange = useCallback((mode) => {
    setViewMode(mode);
    if (mode !== MODES.POS) setActiveEditingJoint(null); // Clear active joint if not in POS mode
    logDebug('info', `View mode changed to: ${mode}`);
  }, [setViewMode, setActiveEditingJoint, logDebug]);

  const coreHandleNavigateEditingBar = useCallback((direction) => {
    setCurrentEditingBar(prevBar => {
      const newBar = (prevBar + direction + totalBarsInSequence) % totalBarsInSequence;
      logDebug('info', `Navigated editing bar: From ${prevBar + 1} to ${newBar + 1}, Direction: ${direction}`);
      setActiveBeatIndex(0); // Reset selected beat to first in new bar
      return newBar;
    });
  }, [totalBarsInSequence, setActiveBeatIndex, logDebug]);

  const coreHandleJointSelect = useCallback((jointAbbrev) => {
    setActiveEditingJoint(prevJoint => {
      const newJoint = prevJoint === jointAbbrev ? null : jointAbbrev;
      logDebug('info', `Joint selected/deselected: ${newJoint || 'None'}. Previous: ${prevJoint}`);
      return newJoint;
    });
  }, [setActiveEditingJoint, logDebug]);

  const coreHandleSaveDataFromModal = useCallback((type, beatId, data, jointAbbrev = null) => {
    logDebug('info', `Saving data from Modal for Beat ID ${beatId}, Type: ${type}`, { data, jointAbbrev });
    setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      const targetBarIndex = currentEditingBar; // Modal always edits the currentEditingBar
      if (newSongData[targetBarIndex]?.beats[beatId]) {
        const targetBeat = newSongData[targetBarIndex].beats[beatId];
        switch (type) {
          case 'jointInfo':
            if (jointAbbrev) {
              if (!targetBeat.jointInfo) targetBeat.jointInfo = {};
              targetBeat.jointInfo[jointAbbrev] = data;
              logDebug('debug', `Saved jointInfo for ${jointAbbrev} in B${targetBarIndex+1}:S${beatId+1}`);
            }
            break;
          case 'grounding':
            targetBeat.grounding = data;
            logDebug('debug', `Saved grounding in B${targetBarIndex+1}:S${beatId+1}`);
            break;
          case 'syllable':
            targetBeat.syllable = data;
            logDebug('debug', `Saved syllable in B${targetBarIndex+1}:S${beatId+1}`);
            break;
          case 'headOver':
            targetBeat.headOver = data;
            logDebug('debug', `Saved headOver in B${targetBarIndex+1}:S${beatId+1}`);
            break;
          default:
            logDebug('warn', `Unknown data type from modal: ${type}`);
        }
      } else {
        logDebug('error', `Target beat B${targetBarIndex+1}:S${beatId+1} not found for saving from modal.`);
      }
      return newSongData;
    });
  }, [currentEditingBar, makeDeepCopy, logDebug]);

  const coreHandleClearDataFromModal = useCallback((type, beatId, jointAbbrev = null) => {
    logDebug('info', `Clearing data from Modal for Beat ID ${beatId}, Type: ${type}`, { jointAbbrev });
     setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      const targetBarIndex = currentEditingBar;
      if (newSongData[targetBarIndex]?.beats[beatId]) {
        const targetBeat = newSongData[targetBarIndex].beats[beatId];
        switch (type) {
          case 'jointInfo':
            if (jointAbbrev && targetBeat.jointInfo?.[jointAbbrev]) {
              delete targetBeat.jointInfo[jointAbbrev];
              logDebug('debug', `Cleared jointInfo for ${jointAbbrev} in B${targetBarIndex+1}:S${beatId+1}`);
            }
            break;
          case 'grounding':
            targetBeat.grounding = { L: null, R: null, L_weight: 50 }; // Reset to default
            logDebug('debug', `Cleared grounding in B${targetBarIndex+1}:S${beatId+1}`);
            break;
          // Syllable and HeadOver can be set to null by Save with empty/null data.
          default:
            logDebug('warn', `Unknown data type for clearing from modal: ${type}`);
        }
      }
      return newSongData;
    });
  }, [currentEditingBar, makeDeepCopy, logDebug]);

  const coreHandleJointNudgeOrJoystickUpdate = useCallback((jointAbbrev, newVectorData, source = "unknown") => {
    if (!jointAbbrev || viewMode !== MODES.POS || activeBeatIndex === null) {
      logDebug('debug', `Nudge/Joystick for ${jointAbbrev} ignored. Mode: ${viewMode}, ActiveBeat: ${activeBeatIndex}`);
      return;
    }
    logDebug('debug', `Nudge/Joystick update for ${jointAbbrev} from ${source}:`, newVectorData);
    setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      const bar = newSongData[currentEditingBar];
      const beat = bar?.beats[activeBeatIndex];
      if (beat) {
        if (!beat.jointInfo) beat.jointInfo = {};
        if (!beat.jointInfo[jointAbbrev]) beat.jointInfo[jointAbbrev] = { vector: POSE_DEFAULT_VECTOR };
        // Preserve other properties like orientation, intent, energy, rotation
        beat.jointInfo[jointAbbrev] = {
            ...beat.jointInfo[jointAbbrev], // Keep existing data
            vector: newVectorData         // Only update vector
        };
      }
      return newSongData;
    });
  }, [viewMode, activeBeatIndex, currentEditingBar, makeDeepCopy, logDebug]);
  // Specific handlers for nudge and joystick for clarity, calling the common one
  const coreHandleJointNudge = useCallback((axis, delta) => {
    if (!activeEditingJoint) return;
    const currentVec = songDataRef.current[currentEditingBar]?.beats[activeBeatIndex]?.jointInfo?.[activeEditingJoint]?.vector || POSE_DEFAULT_VECTOR;
    const newVec = { ...currentVec };
    newVec[axis] = parseFloat(Math.max(-1, Math.min(1, (newVec[axis] || 0) + delta)).toFixed(3));
    logDebug('info', `Nudging Joint ${activeEditingJoint} on axis ${axis} by ${delta}. New vector:`, newVec);
    coreHandleJointNudgeOrJoystickUpdate(activeEditingJoint, newVec, "NudgeButtons");
  }, [activeEditingJoint, currentEditingBar, activeBeatIndex, coreHandleJointNudgeOrJoystickUpdate, logDebug]);

  const coreHandleJointJoystickUpdate = useCallback((jointAbbrev, vector) => { // From SideJointSelector
    logDebug('info', `Joystick Update for ${jointAbbrev}. New vector:`, vector);
    coreHandleJointNudgeOrJoystickUpdate(jointAbbrev, vector, "SideJoystick");
  }, [coreHandleJointNudgeOrJoystickUpdate, logDebug]);
  
  const coreHandleMainUIGroundingChange = useCallback((side, newGroundPoints) => {
    if (viewMode !== MODES.POS || activeBeatIndex === null || currentEditingBar === null) {
      logDebug('warn', `Main UI GroundingChange ignored. Mode: ${viewMode}, ActiveBeat: ${activeBeatIndex}`);
      return;
    }
    logDebug('info', `Main UI GroundingChange for ${side} on B${currentEditingBar+1}:S${activeBeatIndex+1}. Points:`, newGroundPoints);
    setSongData(prevSongData => {
      const nS = makeDeepCopy(prevSongData);
      const bar = nS[currentEditingBar];
      const beat = bar?.beats[activeBeatIndex];
      if (beat) {
        if (!beat.grounding) beat.grounding = { L: null, R: null, L_weight: 50 };
        beat.grounding[side] = newGroundPoints; // newGroundPoints is array or null
      }
      return nS;
    });
  }, [viewMode, activeBeatIndex, currentEditingBar, makeDeepCopy, logDebug]);

  const coreHandleTapTempo = useCallback(() => {
    logDebug('info', 'Tap Tempo button pressed.');
    const now = performance.now();
    const currentTaps = tapTempoDataRef.current.timestamps;
    currentTaps.push(now);

    if (tapTempoDataRef.current.timer) clearTimeout(tapTempoDataRef.current.timer);

    tapTempoDataRef.current.timer = setTimeout(() => {
      const ts = tapTempoDataRef.current.timestamps;
      logDebug('debug', `Tap Tempo timeout. Taps collected: ${ts.length}`);
      if (ts.length >= TAP_TEMPO_MIN_TAPS) {
        let intervals = [];
        for (let i = 1; i < ts.length; i++) {
          intervals.push(ts[i] - ts[i - 1]);
        }
        // Basic outlier removal (optional, can be refined)
        if (intervals.length > 2) {
            const sortedIntervals = [...intervals].sort((a,b) => a-b);
            const median = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
            intervals = intervals.filter(int => int < median * 2.5 && int > median * 0.4); // Wider tolerance
        }
        if (intervals.length >= TAP_TEMPO_MIN_TAPS -1) { // Need at least 2 intervals for 3 taps
            const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
            if (avgInterval > 50 && avgInterval < TAP_TEMPO_MAX_INTERVAL_MS) { // Basic sanity check for interval
                const newBPM = Math.round(60000 / avgInterval);
                logDebug('info', `Tap Tempo calculated BPM: ${newBPM} from avg interval: ${avgInterval.toFixed(2)}ms`);
                coreHandleBpmChange(String(newBPM));
                toast.info(`Tempo set to: ~${newBPM} BPM`);
            } else {
                toast.warn("Tap tempo intervals too erratic or out of range.");
                logDebug('warn', `Tap tempo avg interval out of range: ${avgInterval}`);
            }
        } else {
          toast.warn(`Not enough consistent taps (Need at least ${TAP_TEMPO_MIN_TAPS}).`);
          logDebug('warn', `Not enough valid tap intervals after filtering: ${intervals.length}`);
        }
      } else if (ts.length > 0) { // User tapped, but not enough times
        toast.info(`Tap at least ${TAP_TEMPO_MIN_TAPS} times.`);
      }
      tapTempoDataRef.current.timestamps = []; // Reset after calculation or timeout
    }, TAP_TEMPO_MAX_INTERVAL_MS); // Reset if no tap for X seconds

    // Prune old taps if list grows too long, to prevent excessive memory use for very long tap sessions
    if (currentTaps.length > TAP_TEMPO_MIN_TAPS + 10) {
        tapTempoDataRef.current.timestamps = currentTaps.slice(- (TAP_TEMPO_MIN_TAPS + 5));
    }
  }, [logDebug, coreHandleBpmChange]); // coreHandleBpmChange is stable


  // Bar Operations (Add, Clear, Remove, Copy, Paste)
  const coreHandleAddBar = useCallback(() => {
    setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      const newBarId = newSongData.length;
      newSongData.push({ id: newBarId, beats: Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i)) });
      logDebug('info', `Added new bar. Total bars: ${newSongData.length}`);
      setCurrentEditingBar(newBarId); // Set current editing bar to the new bar
      setActiveBeatIndex(0);       // And select its first beat
      return newSongData;
    });
    toast.success(`Bar ${songDataRef.current.length + 1} added.`); // Use ref for immediate length or adjust
  }, [makeDeepCopy, uiPadsToRender, logDebug, setCurrentEditingBar, setActiveBeatIndex]);

  const coreHandleClearBar = useCallback(() => {
    logDebug('info', `Clearing Bar ${currentEditingBar + 1}`);
    setSongData(prevSongData => {
      const newSongData = makeDeepCopy(prevSongData);
      newSongData[currentEditingBar] = { id: currentEditingBar, beats: Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i)) };
      return newSongData;
    });
    setActiveBeatIndex(0); // Reset selected beat in the cleared bar
    toast.info(`Bar ${currentEditingBar + 1} cleared.`);
  }, [currentEditingBar, makeDeepCopy, uiPadsToRender, setActiveBeatIndex, logDebug]);

  const coreHandleRemoveBar = useCallback(() => {
    if (totalBarsInSequence <= 1) {
      logDebug('warn', 'Cannot remove last bar. Clearing instead.');
      coreHandleClearBar(); // Clear the last bar instead of removing
      toast.info("Last bar cleared (cannot remove).");
      return;
    }
    const barToRemove = totalBarsInSequence -1; // Always remove the last bar
    logDebug('info', `Removing last bar (Bar ${barToRemove + 1}).`);
    setSongData(prevSongData => prevSongData.slice(0, -1));
    // Adjust currentEditingBar if it was the one removed or out of new bounds
    setCurrentEditingBar(prevEditBar => Math.min(prevEditBar, barToRemove - 1, 0));
    setActiveBeatIndex(0);
    toast.success(`Bar ${barToRemove + 1} removed.`);
  }, [totalBarsInSequence, coreHandleClearBar, makeDeepCopy, setCurrentEditingBar, setActiveBeatIndex, logDebug]);

  const coreHandleCopyBar = useCallback(() => {
    const barDataToCopy = songDataRef.current[currentEditingBar];
    if (barDataToCopy) {
      setCopiedBarData(makeDeepCopy(barDataToCopy.beats));
      toast.success(`Bar ${currentEditingBar + 1} copied.`);
      logDebug('info', `Copied Bar ${currentEditingBar + 1} data.`);
    } else {
      toast.error("Failed to copy bar data.");
      logDebug('error', `Failed to copy Bar ${currentEditingBar + 1} - data not found.`);
    }
  }, [currentEditingBar, makeDeepCopy, logDebug]);

  const coreHandlePasteBar = useCallback(() => {
    if (copiedBarData) {
      logDebug('info', `Pasting copied data to Bar ${currentEditingBar + 1}.`);
      setSongData(prevSongData => {
        const newSongData = makeDeepCopy(prevSongData);
        newSongData[currentEditingBar] = { 
          ...(newSongData[currentEditingBar] || { id: currentEditingBar }), // Preserve ID or create
          beats: makeDeepCopy(copiedBarData) 
        };
        return newSongData;
      });
      toast.success(`Pasted to Bar ${currentEditingBar + 1}.`);
    } else {
      toast.warn("No bar data in clipboard to paste.");
      logDebug('warn', 'Paste attempted but no copiedBarData found.');
    }
  }, [currentEditingBar, copiedBarData, makeDeepCopy, logDebug]);
  
  // Looping
  const coreHandleToggleLoop = useCallback(() => {
    const newIsLooping = !isLoopingRef.current;
    setIsLooping(newIsLooping);
    if (!newIsLooping) {
      setLoopStartPoint(null); setLoopEndPoint(null);
      toast.info("Looping OFF.");
      logDebug('info', 'Looping turned OFF.');
    } else {
      // If turning loop ON and no points are set, default to current editing bar
      if (!loopStartPointRef.current && !loopEndPointRef.current) {
        const barForDefaultLoop = currentEditingBar;
        const beatsInDefaultBar = songDataRef.current[barForDefaultLoop]?.beats.length || uiPadsToRender;
        const defaultStart = { bar: barForDefaultLoop, beat: 0 };
        const defaultEnd = { bar: barForDefaultLoop, beat: Math.max(0, beatsInDefaultBar - 1) };
        setLoopStartPoint(defaultStart);
        setLoopEndPoint(defaultEnd);
        toast.success(`Looping ON for Bar ${barForDefaultLoop + 1}.`);
        logDebug('info', `Looping turned ON, default to Bar ${barForDefaultLoop+1}. Start: ${defaultStart.beat+1}, End: ${defaultEnd.beat+1}`);
      } else {
        toast.success("Looping ON.");
        logDebug('info', `Looping turned ON with existing points. Start: B${loopStartPointRef.current?.bar+1}:S${loopStartPointRef.current?.beat+1}, End: B${loopEndPointRef.current?.bar+1}:S${loopEndPointRef.current?.beat+1}`);
      }
    }
  }, [currentEditingBar, uiPadsToRender, logDebug]); // Removed setIsLooping, setLoopStartPoint, setLoopEndPoint from deps as they are setters

  const coreHandleSetLoopPoint = useCallback((type) => { // type is 'start' or 'end'
    const barToSet = isPlayingRef.current ? currentBarRef.current : currentEditingBar;
    const beatToSet = isPlayingRef.current ? currentStepRef.current : (activeBeatIndex ?? 0);
    const pointToSet = { bar: barToSet, beat: beatToSet };

    if (type === 'start') {
      setLoopStartPoint(pointToSet);
      // If new start is after current end, or no end, set end to new start's bar end
      if (!loopEndPointRef.current || pointToSet.bar > loopEndPointRef.current.bar || (pointToSet.bar === loopEndPointRef.current.bar && pointToSet.beat > loopEndPointRef.current.beat)) {
        const beatsInBar = songDataRef.current[pointToSet.bar]?.beats.length || uiPadsToRender;
        setLoopEndPoint({ bar: pointToSet.bar, beat: Math.max(pointToSet.beat, beatsInBar -1) });
        toast.info(`Loop Start set to B${barToSet+1}:S${beatToSet+1}. End point adjusted.`);
        logDebug('info', `Loop Start set to B${barToSet+1}:S${beatToSet+1}. End adjusted.`);
      } else {
        toast.info(`Loop Start set to B${barToSet+1}:S${beatToSet+1}.`);
        logDebug('info', `Loop Start set to B${barToSet+1}:S${beatToSet+1}.`);
      }
    } else { // type === 'end'
      setLoopEndPoint(pointToSet);
      // If new end is before current start, or no start, set start to new end's bar start
      if (!loopStartPointRef.current || pointToSet.bar < loopStartPointRef.current.bar || (pointToSet.bar === loopStartPointRef.current.bar && pointToSet.beat < loopStartPointRef.current.beat)) {
        setLoopStartPoint({ bar: pointToSet.bar, beat: 0 });
        toast.info(`Loop End set to B${barToSet+1}:S${beatToSet+1}. Start point adjusted.`);
        logDebug('info', `Loop End set to B${barToSet+1}:S${beatToSet+1}. Start adjusted.`);
      } else {
        toast.info(`Loop End set to B${barToSet+1}:S${beatToSet+1}.`);
        logDebug('info', `Loop End set to B${barToSet+1}:S${beatToSet+1}.`);
      }
    }
    if (!isLoopingRef.current) setIsLooping(true); // Turn on looping if setting points
  }, [currentEditingBar, activeBeatIndex, uiPadsToRender, logDebug]); // Removed setters from deps

  const coreHandleTimeSignatureChange = useCallback((newTs) => {
    if (setContextTimeSignatureLocal) setContextTimeSignatureLocal(newTs);
    // Note: This does NOT automatically resize songData bars. That's a complex operation.
    // For now, UI renders fixed 16 pads, musicalBeatsPerBar affects playback logic.
    logDebug('info', `Time signature changed in context: ${newTs.beatsPerBar}/${newTs.beatUnit}`);
    toast.info(`Time Signature set to ${newTs.beatsPerBar}/${newTs.beatUnit}. Note: Existing bar data not automatically resized.`);
  }, [setContextTimeSignatureLocal, logDebug]);
  
  const coreHandleMediaOriginalBPMChange = useCallback((newBpmVal) => {
    setMediaOriginalBPM(newBpmVal);
    logDebug('info', `Media Original BPM input changed to: ${newBpmVal}`);
  }, [setMediaOriginalBPM, logDebug]);

  const coreHandleDetectMediaBPM = useCallback(() => {
    toast.info("Detect Media BPM: Feature not yet implemented.");
    logDebug('info', 'Detect Media BPM clicked (WIP).');
  }, [logDebug]);

  const coreHandleSetDetectedBPMAsMaster = useCallback(() => {
    if (mediaOriginalBPM && !isNaN(parseFloat(mediaOriginalBPM))) {
      coreHandleBpmChange(String(mediaOriginalBPM));
      logDebug('info', `Set Media Original BPM (${mediaOriginalBPM}) as Master BPM.`);
    } else {
      toast.warn("No valid Media BPM to set as master.");
      logDebug('warn', 'Attempted to set media BPM as master, but no valid media BPM found.');
    }
  }, [mediaOriginalBPM, coreHandleBpmChange, logDebug]);

  const coreHandleSkipIntervalChange = useCallback((val) => {
    const newDenominator = parseInt(val, 10);
    if (!isNaN(newDenominator) && SKIP_OPTIONS.some(opt => parseInt(opt.value,10) === newDenominator)) {
        setSkipIntervalDenominator(newDenominator);
        logDebug('info', `Skip interval denominator changed to: 1/${newDenominator}`);
    } else {
        logDebug('warn', `Invalid skip interval value: ${val}`);
    }
  }, [setSkipIntervalDenominator, logDebug]);

  const coreHandleToggleShift = useCallback(() => {
    setIsShiftActive(prev => {
      logDebug('info', `Shift key toggled. Was: ${prev}, Now: ${!prev}`);
      return !prev;
    });
  }, [setIsShiftActive, logDebug]);

  const coreHandleSkip = useCallback((direction) => { // direction: 1 for forward, -1 for backward
    const wasPlaying = isPlayingRef.current;
    if (wasPlaying) setIsPlaying(false); // Pause playback for skip

    let newStep = currentStepRef.current + (direction * (uiPadsToRender / skipIntervalDenominator));
    let newBar = currentBarRef.current;

    while (newStep < 0) {
      newStep += uiPadsToRender;
      newBar--;
    }
    while (newStep >= uiPadsToRender) {
      newStep -= uiPadsToRender;
      newBar++;
    }

    if (newBar < 0) newBar = Math.max(0, totalBarsInSequence - 1); // Wrap to last bar if skipping before first
    if (newBar >= totalBarsInSequence) newBar = 0; // Wrap to first bar if skipping after last

    const finalStep = Math.floor(newStep); // Ensure integer step
    setCurrentBar(newBar);
    setCurrentStep(finalStep);
    currentBarRef.current = newBar; // Sync refs
    currentStepRef.current = finalStep;

    // If sequencer was stopped, update editing position as well
    if (!wasPlaying) {
      setCurrentEditingBar(newBar);
      setActiveBeatIndex(finalStep);
    }
    
    logDebug('info', `Skipped ${direction > 0 ? 'Forward' : 'Backward'}. New position: Bar ${newBar + 1}, Beat ${finalStep + 1}`);
    if (wasPlaying) setIsPlaying(true); // Resume playback if it was on
  }, [uiPadsToRender, skipIntervalDenominator, totalBarsInSequence, logDebug]); // Removed setters from deps


  // --- WRAPPED HANDLERS for passing to child components ---
  const handleBpmChangeForInput = useCallback((e) => coreHandleBpmChange(e.target.value), [coreHandleBpmChange]);
  const handleModalBeatSelect = useCallback((beatIdx) => {
    logDebug('info', `Modal beat selected: ${beatIdx + 1}. Updating activeBeatIndex.`);
    setActiveBeatIndex(beatIdx);
  }, [setActiveBeatIndex, logDebug]);

  // For PlaybackControls
  const wrappedPlaybackHandlers = useMemo(() => ({
    onPlayPause: coreHandlePlayPause, onStop: coreHandleStop, onTapTempo: coreHandleTapTempo,
    onNextBar: () => coreHandleNavigateEditingBar(1), onPrevBar: () => coreHandleNavigateEditingBar(-1),
    onAddBar: coreHandleAddBar, onRemoveBar: coreHandleRemoveBar, onClearBar: coreHandleClearBar,
    onToggleLoop: coreHandleToggleLoop, 
    onSetLoopStart: () => coreHandleSetLoopPoint('start'), 
    onSetLoopEnd: () => coreHandleSetLoopPoint('end'),
    onCopyBar: coreHandleCopyBar, onPasteBar: coreHandlePasteBar, canPaste: !!copiedBarData,
    onSkipForward: () => coreHandleSkip(1), onSkipBackward: () => coreHandleSkip(-1),
    onDetectMediaBPM: coreHandleDetectMediaBPM, onSetDetectedBPMAsMaster: coreHandleSetDetectedBPMAsMaster,
    onTimeSignatureChange: coreHandleTimeSignatureChange, 
    onMediaOriginalBPMChange: coreHandleMediaOriginalBPMChange,
    onSkipIntervalChange: (e) => coreHandleSkipIntervalChange(e.target.value), // Assuming select passes value directly
    onToggleShift: coreHandleToggleShift,
    logToConsole: logDebug, // Pass logger to children if needed
  }), [ // Ensure all core handlers are listed if they are stable (useCallback)
    coreHandlePlayPause, coreHandleStop, coreHandleTapTempo, coreHandleNavigateEditingBar,
    coreHandleAddBar, coreHandleRemoveBar, coreHandleClearBar, coreHandleToggleLoop, coreHandleSetLoopPoint,
    coreHandleCopyBar, coreHandlePasteBar, copiedBarData, coreHandleSkip,
    coreHandleDetectMediaBPM, coreHandleSetDetectedBPMAsMaster, coreHandleTimeSignatureChange,
    coreHandleMediaOriginalBPMChange, coreHandleSkipIntervalChange, coreHandleToggleShift, logDebug
  ]);


  // --- useEffect HOOKS ---

  // Sync with context BPM
  useEffect(() => {
    logDebug('effect', `Syncing contextBpm (${contextBpm}) with localBpm (${bpm})`);
    if (contextBpm !== undefined && contextBpm !== bpm) {
      setBpm(contextBpm);
    }
  }, [contextBpm, bpm, setBpm, logDebug]); // Added setBpm

  // Preload sounds for selected kit
  useEffect(() => {
    logDebug('effect', `Attempting to preload sounds for kit: ${selectedKitName}`);
    const kitToLoad = AVAILABLE_KITS.find(k => k.name === selectedKitName) || DEFAULT_SOUND_KIT;
    setIsLoadingSounds(true);
    setErrorLoadingSounds(null);
    if (audioManager.preloadSounds) {
      audioManager.preloadSounds(kitToLoad.sounds) // Pass array of sound objects
        .then(() => {
          setIsLoadingSounds(false);
          logDebug('info', `Sounds PRELOADED successfully for kit: ${kitToLoad.displayName || kitToLoad.name}`);
        })
        .catch(e => {
          setErrorLoadingSounds(e.message || "Unknown error preloading sounds");
          setIsLoadingSounds(false);
          logDebug('error', `Sound PRELOAD FAILED for kit: ${kitToLoad.name}`, e);
          toast.error(`Failed to preload sounds for ${kitToLoad.displayName || kitToLoad.name}.`);
        });
    } else {
      setErrorLoadingSounds("AudioManager 'preloadSounds' function is missing.");
      setIsLoadingSounds(false);
      logDebug('error', "AudioManager 'preloadSounds' function is missing.");
      toast.error("Critical audio system error.");
    }
  }, [selectedKitName, logDebug]); // Only re-run if selectedKitName changes

  // Playback Interval useEffect
  useEffect(() => {
    const currentBpmForInterval = bpmRef.current; // Use ref for current BPM in interval
    const currentTimeSigForInterval = contextTimeSignature || DEFAULT_TIME_SIGNATURE;
    // const stepsPerBarForInterval = uiPadsToRender; // UI pads determine sequencer steps
    const musicalBeatsInBarForInterval = currentTimeSigForInterval.beatsPerBar;
    // How many sequencer steps constitute one musical beat (e.g., 16 pads / 4 beats = 4 steps per musical beat)
    const stepsPerMusicalBeat = uiPadsToRender / musicalBeatsInBarForInterval;

    const shouldRunInterval = isPlayingRef.current && !isLoadingSounds && !errorLoadingSounds && currentBpmForInterval > 0;
    
    logDebug('debug', `Playback Interval Setup Check. ShouldRun: ${shouldRunInterval}`, 
              { isPlaying: isPlayingRef.current, isLoading: isLoadingSounds, error: errorLoadingSounds, bpm: currentBpmForInterval });

    if (shouldRunInterval) {
      let intervalTimeMs;
      if (currentBpmForInterval > 0 && stepsPerMusicalBeat > 0 && isFinite(stepsPerMusicalBeat)) {
        // Time for one musical beat / number of sequencer steps within that musical beat
        intervalTimeMs = (60000 / currentBpmForInterval) / stepsPerMusicalBeat;
      } else { // Fallback if calculations are off
        logDebug('warn', 'Invalid parameters for interval calculation, using fallback.');
        intervalTimeMs = (60000 / DEFAULT_BPM) / (DEFAULT_NUM_BEATS_PER_BAR_CONST / DEFAULT_TIME_SIGNATURE.beatsPerBar);
      }
      // Sanity check interval time
      if (!isFinite(intervalTimeMs) || intervalTimeMs <= 10) {
        logDebug('warn', `Calculated intervalTimeMs is invalid (${intervalTimeMs}), defaulting to 50ms.`);
        intervalTimeMs = 50; 
      }
      
      logDebug('info', `Playback interval STARTING. Target BPM: ${currentBpmForInterval}, StepsPerMusBeat: ${stepsPerMusicalBeat.toFixed(2)}, Interval: ${intervalTimeMs.toFixed(2)}ms`);
      
      intervalRef.current = setInterval(() => {
        if (!isPlayingRef.current) { // Double check, in case state changed rapidly
          clearInterval(intervalRef.current); 
          intervalRef.current = null; 
          logDebug('debug', 'Interval cleared: isPlaying became false.');
          return; 
        }

        const currentBarVal = currentBarRef.current;
        const currentStepVal = currentStepRef.current;
        const songDataVal = songDataRef.current;

        const barData = songDataVal[currentBarVal];
        if (!barData || !barData.beats) {
          logDebug('error', `Playback HALTED: Missing barData or beats for Bar ${currentBarVal + 1}.`);
          setIsPlaying(false); // Stop playback
          return;
        }
        
        const stepsInCurrentBar = barData.beats.length || uiPadsToRender; // Should be uiPadsToRender (16)
        const currentBeatObject = barData.beats[currentStepVal];

        // Update timecode display (MM:SS:CS)
        const totalElapsedSteps = currentBarVal * uiPadsToRender + currentStepVal;
        const elapsedTimeMs = totalElapsedSteps * intervalTimeMs;
        const totalSeconds = Math.floor(elapsedTimeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((elapsedTimeMs % 1000) / 10);
        setMainTimecodeParts({
            mm: String(minutes).padStart(2, '0'),
            ss: String(seconds).padStart(2, '0'),
            cs: String(centiseconds).padStart(2, '0')
        });
        
        // Play sounds if in SEQ mode and beat has sounds
        if (viewMode === MODES.SEQ && currentBeatObject?.sounds?.length > 0) {
          const kitForPlayback = AVAILABLE_KITS.find(k => k.name === selectedKitName) || DEFAULT_SOUND_KIT;
          currentBeatObject.sounds.forEach(soundNameOrKey => {
            const soundToPlay = kitForPlayback.sounds.find(s => s.name === soundNameOrKey || s.key === soundNameOrKey);
            if (soundToPlay?.url && audioManager.playSound) {
              audioManager.playSound(soundToPlay.url);
              // logDebug('debug', `Played sound '${soundToPlay.name}' from B${currentBarVal+1}:S${currentStepVal+1}`);
            }
          });
        }
        
        // Advance step/bar logic
        let nextStep = currentStepVal + 1;
        let nextBar = currentBarVal;
        let stopPlayback = false;

        if (nextStep >= stepsInCurrentBar) {
          nextStep = 0;
          nextBar++;
          if (nextBar >= totalBarsInSequence) { // End of sequence
            if (isLoopingRef.current && loopStartPointRef.current) {
              logDebug('debug', 'Reached end of sequence, looping back to start point.');
              nextBar = loopStartPointRef.current.bar;
              nextStep = loopStartPointRef.current.beat;
              if (!songDataVal[nextBar]?.beats[nextStep]) { // Safety check for loop point validity
                  logDebug('error', 'Loop start point is invalid. Stopping playback.');
                  stopPlayback = true;
              }
            } else {
              logDebug('info', 'Reached end of sequence, stopping playback (no loop).');
              stopPlayback = true;
              // Stay on last step for UI
              nextBar = Math.max(0, totalBarsInSequence - 1); 
              const lastBarBeats = songDataVal[nextBar]?.beats.length || uiPadsToRender;
              nextStep = Math.max(0, lastBarBeats - 1);
            }
          }
        }

        // Check loop end point
        if (isLoopingRef.current && loopEndPointRef.current && !stopPlayback) {
          if (currentBarVal === loopEndPointRef.current.bar && currentStepVal === loopEndPointRef.current.beat) {
            logDebug('debug', 'Reached loop end point, jumping to loop start point.');
            nextBar = loopStartPointRef.current.bar;
            nextStep = loopStartPointRef.current.beat;
            if (!songDataVal[nextBar]?.beats[nextStep]) { // Safety check
                logDebug('error', 'Loop start point (from end jump) is invalid. Stopping playback.');
                stopPlayback = true;
            }
          }
        }

        if (stopPlayback) {
          setIsPlaying(false); // This will clear the interval in the next effect run
          // Update currentStep/Bar to the final position for UI consistency
          setCurrentStep(nextStep); 
          setCurrentBar(nextBar);
        } else {
          setCurrentStep(nextStep);
          setCurrentBar(nextBar);
        }
      }, intervalTimeMs);
    } else if (intervalRef.current) {
      logDebug('debug', 'Playback interval STOPPING (shouldRunInterval is false).');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { // Cleanup function for the effect
      if (intervalRef.current) {
        logDebug('debug', 'Playback interval effect CLEANUP: Clearing interval.');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ // Dependencies for the playback interval effect
    isPlaying, bpm, // Direct state values that influence interval timing or run condition
    contextTimeSignature, // From context, affects musical timing
    isLoadingSounds, errorLoadingSounds, // Run conditions
    // No need to list refs here (bpmRef, isPlayingRef etc.)
    // Setters like setIsPlaying, setCurrentStep, setCurrentBar are stable
    totalBarsInSequence, uiPadsToRender, // Derived values based on songData/constants
    viewMode, selectedKitName, // For sound playback logic within interval
    logDebug // Stable callback
  ]);


  // Keyboard Event Listener useEffect
  useEffect(() => {
    logDebug('effect', 'Attaching global keyboard listener.');
    const handleKeyDown = (e) => {
      const targetTagName = e.target?.tagName?.toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTagName) && e.key !== 'Escape') {
        logDebug('debug', `Keydown '${e.key}' ignored in input field: ${targetTagName}`);
        return;
      }

      const keyLower = e.key.toLowerCase();
      let handled = false;

      logDebug('debug', `Keydown event: Key='${e.key}', Lower='${keyLower}', Shift=${e.shiftKey}, Ctrl=${e.ctrlKey}, ViewMode='${viewMode}'`);

      // --- Try Beat Pad Keys First (for "Live Drumming" / Auditioning) ---
      const beatIndexFromKey = KEYBOARD_LAYOUT_MODE_SEQ[keyLower];
      if (beatIndexFromKey !== undefined) {
        logDebug('info', `Pad Key '${keyLower}' pressed (Beat Index: ${beatIndexFromKey})`);
        setActiveBeatIndex(beatIndexFromKey); // Highlight the pad

        const beatData = songDataRef.current[currentEditingBar]?.beats[beatIndexFromKey];
        const soundsOnPad = beatData?.sounds || [];
        if (soundsOnPad.length > 0) {
          const kitForPlayback = currentSelectedKitObject; // Use memoized version
          soundsOnPad.forEach(soundNameOrKey => {
            const soundObj = kitForPlayback.sounds.find(s => s.name === soundNameOrKey || s.key === soundNameOrKey);
            if (soundObj?.url && audioManager.playSound) {
              audioManager.playSound(soundObj.url);
              logDebug('info', `LiveDrum: Pad ${currentEditingBar + 1}:${beatIndexFromKey + 1} - Played sound: ${soundObj.name}`);
            }
          });
        } else {
          logDebug('info', `LiveDrum: Pad ${currentEditingBar + 1}:${beatIndexFromKey + 1} - No sounds programmed.`);
        }

        // If in SEQ mode AND a sound is armed, then also program the pad
        if (viewMode === MODES.SEQ && currentSoundInBank) { // currentSoundInBank is NAME/KEY
          logDebug('debug', `SEQ Mode: Programming Pad ${currentEditingBar + 1}:${beatIndexFromKey + 1} with armed sound: ${currentSoundInBank}`);
          coreHandleAddSoundToBeat(currentEditingBar, beatIndexFromKey, currentSoundInBank);
        }
        handled = true;
      }

      // --- If not a pad key, check other global controls ---
      if (!handled) {
        const modeSwitchKey = KEYBOARD_MODE_SWITCH[keyLower];
        if (modeSwitchKey) {
          logDebug('info', `Mode Switch Key '${keyLower}' to '${modeSwitchKey}'.`);
          coreHandleModeChange(modeSwitchKey);
          handled = true;
        }
      }

      if (!handled) {
        const transportKeyAction = KEYBOARD_TRANSPORT_CONTROLS[e.key]; // Use e.key for space, Enter
        if (transportKeyAction) {
          logDebug('info', `Transport Key '${e.key}' for action '${transportKeyAction}'. Shift: ${e.shiftKey}`);
          if (transportKeyAction === 'playPause') wrappedPlaybackHandlers.onPlayPause();
          else if (transportKeyAction === 'stop') wrappedPlaybackHandlers.onStop();
          // Arrow key logic for skip/bar navigation (now inside component)
          else if (e.key === 'ArrowLeft') { e.shiftKey ? wrappedPlaybackHandlers.onPrevBar() : wrappedPlaybackHandlers.onSkipBackward(); handled = true;}
          else if (e.key === 'ArrowRight') { e.shiftKey ? wrappedPlaybackHandlers.onNextBar() : wrappedPlaybackHandlers.onSkipForward(); handled = true;}
          // Potentially add other direct transport key mappings if needed
        }
      }
      
      // --- POS Mode Specific Keys (if not handled by pad keys or global keys) ---
      if (!handled && viewMode === MODES.POS) {
        const posNavKeyAction = KEYBOARD_NAVIGATION_POS_MODE[e.key]; // Uses e.key for potential arrows
        if (posNavKeyAction) {
          logDebug('info', `POS Mode Nav Key '${e.key}' for action '${posNavKeyAction}'.`);
          setActiveBeatIndex(prev => {
            const newIdx = posNavKeyAction === 'prevBeat' ? (prev - 1 + uiPadsToRender) % uiPadsToRender : (prev + 1) % uiPadsToRender;
            logDebug('debug', `POS Nav: activeBeatIndex from ${prev} to ${newIdx}`);
            return newIdx;
          });
          handled = true;
        }

        const nudgeParams = KEYBOARD_JOINT_NUDGE_CONTROLS[keyLower]; // Uses keyLower
        if (nudgeParams && activeEditingJoint) {
          logDebug('info', `POS Mode Nudge Key '${keyLower}' for joint '${activeEditingJoint}', axis '${nudgeParams.axis}'.`);
          coreHandleJointNudge(nudgeParams.axis, nudgeParams.delta);
          handled = true;
        }

        if ((keyLower === 'm' || e.key === 'Enter') && activeBeatIndex !== null && !isPoseEditorModalOpen) {
          logDebug('info', `POS Mode: Open Modal Key '${e.key}'.`);
          setIsPoseEditorModalOpen(true);
          handled = true;
        }
      }

      // Global Escape for Modal
      if (e.key === 'Escape' && isPoseEditorModalOpen) {
        logDebug('info', 'Escape Key: Closing Pose Editor Modal.');
        setIsPoseEditorModalOpen(false);
        handled = true;
      }
      
      // Shift key state for other shortcuts (handled by onToggleShift via PlaybackControls)
      if (keyLower === 'shift') { // This is a bit raw, better to use e.shiftKey where needed
          // onToggleShift(); // Let PlaybackControls manage this perhaps or directly set isShiftActive
      }


      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Optional: Add keyup for shift state if needed, but e.shiftKey on keydown is usually enough
    // window.addEventListener('keyup', handleKeyUp); 
    return () => {
      logDebug('effect', 'Cleaning up global keyboard listener.');
      window.removeEventListener('keydown', handleKeyDown);
      // window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ // Dependencies for Keyboard Listener
    viewMode, currentSoundInBank, currentEditingBar, activeEditingJoint, isPoseEditorModalOpen,
    coreHandleModeChange, setActiveBeatIndex, uiPadsToRender, coreHandleJointNudge, setIsPoseEditorModalOpen,
    coreHandleAddSoundToBeat, wrappedPlaybackHandlers, // wrappedPlaybackHandlers itself is memoized
    selectedKitName, currentSelectedKitObject, // For live drumming sounds
    logDebug
  ]);

  // Update Notation Text when relevant data changes (active beat, or playing step)
  useEffect(() => {
    const beatToNotate = isPlayingRef.current 
        ? songDataRef.current[currentBarRef.current]?.beats[currentStepRef.current]
        : beatDataForActiveSelection; // Uses currentEditingBar & activeBeatIndex from state

    const barForNotation = isPlayingRef.current ? currentBarRef.current : currentEditingBar;
    const stepForNotation = isPlayingRef.current ? currentStepRef.current : activeBeatIndex;

    if (beatToNotate && typeof stepForNotation === 'number') {
      logDebug('effect', `Generating notation for B${barForNotation + 1}:S${stepForNotation + 1}`);
      const newNotation = generateNotationForBeat(barForNotation, stepForNotation, beatToNotate, mainTimecodeParts);
      setNotationText(newNotation);
    } else {
      logDebug('debug', 'Skipping notation generation, no valid beat to notate.');
       setNotationText({ shorthand: "N/A", plainEnglish: "N/A (No beat selected/playing or data missing)", analysis: "N/A" });
    }
  }, [
      isPlaying, currentStep, currentBar, // For playback
      activeBeatIndex, currentEditingBar, songData, // For selected beat & when songData itself changes
      mainTimecodeParts, beatDataForActiveSelection, // beatDataForActiveSelection ensures update on UI selection change
      logDebug
    ]);


  // --- RENDER SECTION ---
  if (isLoadingSounds && !errorLoadingSounds) return <div className="text-white p-4 text-center text-xl animate-pulse">Loading SĒQsync Environment... Sounds are awakening...</div>;
  if (errorLoadingSounds) return <div className="text-red-500 p-4 text-center text-xl">Critical Error: Could not load sounds - {errorLoadingSounds}. Please check console and refresh.</div>;

  return (
    <div className="p-2 sm:p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center font-sans select-none">
      <div className="w-full max-w-7xl xl:max-w-screen-2xl mx-auto"> {/* Wider on larger screens */}
        {/* Top Control Bar: Load/Save, Media, SoundBank, Mode Switches, Skeleton Toggle */}
        <div className="mb-3 sm:mb-4 p-2 bg-gray-800 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-2 sticky top-0 z-20 backdrop-blur-sm bg-opacity-80">
           <div className="flex items-center gap-1 sm:gap-2">
             <LoadSave 
                onLoad={() => { logDebug('info','Load Sequence Clicked (WIP)'); toast.info("Load .seq file: WIP"); }}
                onSave={() => { logDebug('info','Save Sequence Clicked (WIP)'); toast.info("Save .seq file: WIP"); }}
             />
             <FileUploader onMediaUpload={() => { logDebug('info','Upload Media Clicked (WIP)'); toast.info("Media Upload/Link: WIP"); }} />
           </div>
            <SoundBank
              soundKits={AVAILABLE_KITS.reduce((acc, kit) => { // Ensure soundKits prop structure
                  acc[kit.name] = { 
                      displayName: kit.displayName || kit.name, 
                      sounds: kit.sounds, // Array of sound objects
                      fileMap: kit.fileMap  // Object { soundName: url }
                  };
                  return acc;
              }, {})}
              selectedKitName={selectedKitName} onKitSelect={coreHandleKitSelect}
              currentSoundInKit={currentSoundInBank} // Pass the sound NAME/KEY
              onSoundInKitSelect={coreHandleSoundSelectedInBank}
              isCompact={true} logToConsole={logDebug} isAdmin={currentUser?.role === 'admin'}
              onUploadKitClick={() => {logDebug('info', 'Admin Kit Upload clicked'); toast.info("Admin Kit Upload UI Placeholder");}}
            />
           <div className="flex items-center gap-1">
             <Button onClick={() => coreHandleModeChange(MODES.POS)} size="xs" className={`!px-3 ${viewMode === MODES.POS ? '!bg-purple-600 text-white' : 'bg-gray-600 hover:!bg-purple-700'}`} title="Pose Edit Mode (P)">POS</Button>
             <Button onClick={() => coreHandleModeChange(MODES.SEQ)} size="xs" className={`!px-3 ${viewMode === MODES.SEQ ? '!bg-blue-600 text-white' : 'bg-gray-600 hover:!bg-blue-700'}`} title="Sequence Edit Mode (S)">SEQ</Button>
             {/* <Button onClick={() => coreHandleModeChange(MODES.SYNC)} size="xs" className={`!px-3 ${viewMode === MODES.SYNC ? '!bg-teal-600 text-white' : 'bg-gray-600 hover:!bg-teal-700'}`} title="Media Sync Mode (C)">SYNC</Button> */}
           </div>
           <div className="flex items-center gap-2">
            <Tooltip content={showMainSkeletonLines ? "Hide Skeleton Lines" : "Show Skeleton Lines"} wrapperElementType="span">
                <Button onClick={() => setShowMainSkeletonLines(p => !p)} variant="icon" size="xs" className={`!p-1.5 text-xl ${showMainSkeletonLines ? 'text-yellow-400' : 'text-gray-400'}`}> <FontAwesomeIcon icon={showMainSkeletonLines ? faEye : faEyeSlash}/> </Button>
            </Tooltip>
            {/* <Button variant="icon" size="xs" className="!p-1.5" title="Settings (WIP)"><FontAwesomeIcon icon={faCog}/></Button> */}
           </div>
        </div>

        {/* Main Content Grid: Side Selectors, Central Visualizer/Pads, Detail Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Left Column: Joint Selectors or Placeholder */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col space-y-3">
            {viewMode === MODES.POS ? ( <>
                <SideJointSelector side="L" activeJoint={activeEditingJoint} onJointSelect={coreHandleJointSelect} onJointJoystickUpdate={coreHandleJointJoystickUpdate} viewMode={viewMode} activeBeatVector={activeJointCurrentVector} logToConsole={logDebug} className="w-full" />
                <SideJointSelector side="R" activeJoint={activeEditingJoint} onJointSelect={coreHandleJointSelect} onJointJoystickUpdate={coreHandleJointJoystickUpdate} viewMode={viewMode} activeBeatVector={activeJointCurrentVector} logToConsole={logDebug} className="w-full" />
            </> ) : ( <div className="h-full min-h-[200px] bg-gray-800/10 rounded-lg p-2 text-center text-gray-500 text-sm flex items-center justify-center">Switch to POS mode to edit joints.</div> )}
          </div>

          {/* Center Column: Visualizer (POS) / Main Pads Area (SEQ) */}
          <div className="md:col-span-6 lg:col-span-8 flex flex-col items-center space-y-3">
            {viewMode === MODES.POS && (
              <>
                <div className="w-full max-w-xs sm:max-w-sm mx-auto aspect-[3/4] bg-gray-800/30 rounded-md p-1 shadow-lg">
                    <SkeletalPoseVisualizer2D 
                        jointInfoData={beatDataForActiveSelection.jointInfo} 
                        highlightJoint={activeEditingJoint} 
                        showLines={showMainSkeletonLines} 
                        onJointClick={coreHandleJointSelect} // Allow clicking on visualizer to select joint
                        className="w-full h-full" 
                        width={240} height={320} // Slightly larger default for main view
                    />
                </div>
                <div className="flex justify-around w-full items-center mt-2 p-2 bg-gray-800/50 rounded-md shadow-md">
                  <div className={`relative group ${MAIN_FOOT_DISPLAY_SIZE_CLASSES}`}> 
                    <FootDisplay side="L" groundPoints={mainLeftGrounding} type="image" sizeClasses="w-full h-full" rotation={mainLeftAnkleRotation} />
                    <FootJoystickOverlay side="L" onGroundingChange={coreHandleMainUIGroundingChange} isActive={true} logToConsoleFromParent={logDebug} />
                  </div>
                  <div className="text-center px-2 sm:px-4"> <p className="text-sm text-gray-400">Grounding</p> <p className="text-xs text-gray-500">(Drag on Feet)</p> </div>
                  <div className={`relative group ${MAIN_FOOT_DISPLAY_SIZE_CLASSES}`}> 
                    <FootDisplay side="R" groundPoints={mainRightGrounding} type="image" sizeClasses="w-full h-full" rotation={mainRightAnkleRotation} />
                    <FootJoystickOverlay side="R" onGroundingChange={coreHandleMainUIGroundingChange} isActive={true} logToConsoleFromParent={logDebug} />
                  </div>
                </div>
                {/* <CoreDynamicsVisualizer coreJointData={...} beatGrounding={...} /> */}
              </>
            )}
            {/* Beat Pads Display (Always visible, content changes based on mode) */}
             <div className="mt-1 sm:mt-2 w-full"> {/* Reduced top margin if visualizer is not shown */}
                <div className="text-xs text-gray-400 mb-1 px-1">
                    Editing Bar: <span className="font-semibold text-gray-200">{currentEditingBar + 1}</span> / {totalBarsInSequence}
                    {viewMode === MODES.POS && activeBeatIndex !== null && ` | Step: <span className="font-semibold text-gray-200">${activeBeatIndex + 1}</span>`}
                </div>
                {/* Two rows of 8 pads each */}
                {[0, 1].map(rowIndex => (
                    <div key={`beat-pad-row-${rowIndex}`} className="grid gap-0.5 sm:gap-1 mb-0.5 sm:mb-1" style={{ gridTemplateColumns: `repeat(${BEATS_PER_ROW_DISPLAY}, minmax(0, 1fr))` }}>
                    {Array.from({ length: BEATS_PER_ROW_DISPLAY }).map((_, colIndex) => {
                        const beatIdx = rowIndex * BEATS_PER_ROW_DISPLAY + colIndex;
                        // currentBarBeatsForUI is guaranteed to have uiPadsToRender (16) beats
                        const beatObject = currentBarBeatsForUI[beatIdx] || createDefaultBeatObject(beatIdx);
                        const isBeatActiveForMode = (viewMode === MODES.SEQ && beatObject?.sounds?.length > 0) || 
                                                  (viewMode === MODES.POS && beatIdx === activeBeatIndex);
                        const hasPoseDataIndicator = viewMode === MODES.POS && beatObject?.jointInfo && Object.keys(beatObject.jointInfo).length > 0;

                        return ( 
                            <BeatButton 
                                key={`main-beat-${currentEditingBar}-${beatIdx}`} 
                                beatIndex={beatIdx} 
                                barIndex={currentEditingBar} 
                                isActive={isBeatActiveForMode} 
                                isCurrentStep={currentBar === currentEditingBar && beatIdx === currentStep && isPlayingRef.current} 
                                onClick={() => coreHandleBeatClick(currentEditingBar, beatIdx)} 
                                sounds={beatObject?.sounds} // For SEQ mode display
                                // Pass hasPoseData prop if BeatButton uses it for POS mode indicator
                                // hasPoseData={hasPoseDataIndicator} 
                                viewMode={viewMode} 
                            /> 
                        );
                    })}
                    </div>
                ))}
            </div>
          </div>

          {/* Right Column: JointInputPanel (POS) or Live Notation (SEQ/General) */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col space-y-3">
            {viewMode === MODES.POS && activeEditingJoint && (
                 <JointInputPanel 
                    key={`${activeEditingJoint}-${currentEditingBar}-${activeBeatIndex}`} // Force re-mount on key change
                    initialJointData={beatDataForActiveSelection.jointInfo?.[activeEditingJoint] || {}} 
                    activeJointAbbrev={activeEditingJoint} 
                    onSaveJointDetails={(abbrev, details) => coreHandleSaveDataFromModal('jointInfo', activeBeatIndex, details, abbrev)}
                    onClearJointDetails={(abbrev) => coreHandleClearDataFromModal('jointInfo', activeBeatIndex, abbrev)}
                    onLiveChange={(details) => { /* Live change on main UI could be complex, handle if needed */ }}
                    logToConsole={logDebug}
                    // Pass ankle specific state and setters if JointInputPanel handles them directly
                    // These would need to be part of beatDataForActiveSelection.jointInfo[activeEditingJoint] ideally
                    isAnkleJointActive={activeEditingJoint === leftAnkleKey || activeEditingJoint === rightAnkleKey}
                    // The below props for specific ankle orientations are typically managed *within* JointInputPanel
                    // based on its own state, initialized from initialJointData.
                    // Or, SSC passes its own state vars if it controls them directly for the active joint.
                    // For now, assuming JIP handles its own ankle state based on initialJointData.
                 />
            )}
            {viewMode === MODES.POS && activeBeatIndex !== null && (
                <Button onClick={() => { logDebug('info', 'Open Full Pose Editor Modal button clicked.'); setIsPoseEditorModalOpen(true); }} variant="primary" className="w-full !bg-indigo-600 hover:!bg-indigo-500 !py-2 text-sm" title="Open Detailed Pose Editor for Current Step (M or Enter)">
                    Edit Step Details
                </Button>
            )}
            <div className="p-2 bg-gray-800/30 rounded-md text-xs text-gray-400 space-y-1 flex-grow min-h-[150px] max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                <p className="font-semibold text-gray-300 text-sm mb-1 sticky top-0 bg-gray-800/80 backdrop-blur-sm py-1">Live Notation (Active/Playing Step):</p>
                <div className="font-mono text-[0.6rem] sm:text-[0.65rem] leading-tight whitespace-pre-wrap">
                    <p className="text-yellow-400 mb-1.5"><span className="font-bold text-gray-200">Shorthand:</span> {notationText.shorthand}</p>
                    <p className="text-blue-300 mb-1.5"><span className="font-bold text-gray-200">Plain Eng:</span> {notationText.plainEnglish}</p>
                    <p className="text-teal-300"><span className="font-bold text-gray-200">Medical:</span> {notationText.analysis}</p>
                </div>
            </div>
            {viewMode === MODES.SEQ && ( <div className="h-full min-h-[100px] bg-gray-800/10 rounded-lg p-2 text-center text-gray-500 text-sm flex items-center justify-center">POS mode for detailed joint editing.</div> )}
          </div>
        </div>

        {/* Bottom Control Bar: PlaybackControls */}
        <div className="mt-3 sm:mt-4 p-1.5 sm:p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md sticky bottom-0 z-20">
            <PlaybackControls
                {...wrappedPlaybackHandlers} // Spreads all memoized core handlers
                bpm={bpm} onBpmChange={handleBpmChangeForInput} // Pass the direct event handler
                isPlaying={isPlayingRef.current} // Pass the ref's current value for immediate UI update
                isLooping={isLoopingRef.current}
                currentBar={currentBar + 1} // Display as 1-indexed
                totalBars={totalBarsInSequence} 
                currentBeatInBar={currentStep + 1} // Display as 1-indexed
                beatsPerBar={musicalBeatsPerBar} // Musical beats per bar
                appMode={viewMode} 
                currentEditingBarDisplay={currentEditingBar + 1} // For "EDIT BAR" display
                timeSignature={contextTimeSignature || DEFAULT_TIME_SIGNATURE}
                isShiftActive={isShiftActive} 
                skipIntervalDenominator={skipIntervalDenominator}
                mainTimecodeParts={mainTimecodeParts} 
                mediaSrc={null} // Placeholder for SYNC mode
                mediaOriginalBPM={mediaOriginalBPM} 
                isDetectingBPM={false} // Placeholder
            />
        </div>

        {/* Pose Editor Modal */}
        {isPoseEditorModalOpen && beatDataForModal && activeBeatIndex !== null && (
          <PoseEditorModalComponent
            isOpen={isPoseEditorModalOpen} onClose={() => { logDebug('info', 'Closing Pose Editor Modal.'); setIsPoseEditorModalOpen(false);}}
            initialBeatDataForModal={beatDataForModal} 
            initialActiveJointAbbrev={activeEditingJoint} // Pass current active joint to modal
            currentBarSongData={currentBarSongDataForModal} // Pass full bar data for mini-pads
            onModalBeatSelect={handleModalBeatSelect} // For navigating beats within modal
            onSaveJointDetails={(beatId, abbrev, details) => coreHandleSaveDataFromModal('jointInfo', beatId, details, abbrev)}
            onClearJointDetails={(beatId, abbrev) => coreHandleClearDataFromModal('jointInfo', beatId, abbrev)}
            onSaveGrounding={(beatId, data) => coreHandleSaveDataFromModal('grounding', beatId, data)}
            onClearGrounding={(beatId) => coreHandleClearDataFromModal('grounding', beatId)}
            onSaveSyllable={(beatId, data) => coreHandleSaveDataFromModal('syllable', beatId, data)}
            onSaveHeadOver={(beatId, data) => coreHandleSaveDataFromModal('headOver', beatId, data)}
            logToConsoleFromParent={logDebug}
            currentShowSkeletonLinesState={showMainSkeletonLines} // Sync skeleton line visibility
            onToggleSkeletonLinesInModal={() => setShowMainSkeletonLines(p => !p)}
            onJointSelectInModal={coreHandleJointSelect} // Allow modal to change main active joint
          />
        )}
      </div>
    </div>
  );
};

export default StepSequencerControls;