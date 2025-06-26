import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDrum, faUserEdit, faSyncAlt, faCog, faUpload, faSave, faFolderOpen,
  faFileCirclePlus, faFileCode, faEye, faEyeSlash, faAtom, faPersonRunning,
  faPlay, faPause, faStop, faStepBackward, faStepForward,
  faRecordVinyl, faUndoAlt, faRedoAlt, faPlus, faMinus, faKeyboard, faCrosshairs, faCopy, faPaste,
  faEraser, faMagnet, faMusic, faVideo
} from '@fortawesome/free-solid-svg-icons';

import {
  DEFAULT_NUM_BEATS_PER_BAR_CONST,
  createDefaultBeatObject,
  MODE_SEQ, MODE_POS, MODE_SYNC, INTERNAL_SEQUENCER_RESOLUTION,
  MAX_SOUNDS_PER_BEAT, BEATS_PER_ROW_DISPLAY,
  BPM_MIN, BPM_MAX, DEFAULT_TIME_SIGNATURE, DEFAULT_BPM,
  MAX_BEATS_PER_BAR_HARD_LIMIT,
  TAP_TEMPO_MIN_TAPS, TAP_TEMPO_MAX_INTERVAL_MS,
  createNewBarData 
} from '../../../utils/constants.js'; 

import SoundBank from './SoundBank';
import FileUploader from '../media/FileUploader';
import BeatButton from './BeatButton'; 
import PlaybackControls from '../transport/PlaybackControls';
import SideJointSelector from '../pose_editor/SideJointSelector';
import VideoMediaPlayer from '../media/VideoMediaPlayer';
import FootDisplay from '../pose_editor/FootDisplay';
import AudioBeatVisualizer from './AudioBeatVisualizer';
import PoseEditorModalComponent from '../pose_editor/PoseEditorModalComponent';
import LoadSave from '../../common/LoadSave';
import MotionTrackingOverlay from '../media/MotionTrackingOverlay';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import SkeletalPoseVisualizer2D from '../pose_editor/SkeletalPoseVisualizer2D';
import CoreDynamicsVisualizer from '../pose_editor/CoreDynamicsVisualizer';
import { useAuth } from '../../../hooks/useAuth';
import { useSequencerSettings } from '../../../contexts/SequencerSettingsContext';
import { readFileAsText, downloadFile } from '../../../utils/fileUtils.js';
import {
  preloadSounds as managerPreloadSounds, playSound as managerPlaySound,
  resumeAudioContext, getAudioContext
} from '../../../utils/audioManager';
import {
  tr808SoundFiles, getSoundNameFromPath, tr808SoundKeys,
  ALL_JOINTS_MAP, UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW
} from '../../../utils/sounds';
import { generateNotationForBeat } from '../../../utils/notationUtils';
import { detectBPMFromFile } from '../../../utils/BPMDetect';

const MAX_BARS_ASSUMED = 256; 
// Ensured MAIN_FOOT_DISPLAY_SIZE_CLASSES is defined at the module level
const MAIN_FOOT_DISPLAY_SIZE_CLASSES = "w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[180px] md:h-[180px] lg:w-[210px] lg:h-[210px]";

const StepSequencerControls = () => {
  // SECTION 1: CONTEXTS
  const { user } = useAuth();
  const { bpm: contextBpm, setBpm: setContextBpm, timeSignature: contextTimeSignature, setTimeSignature: setContextTimeSignature } = useSequencerSettings();
  const navigate = useNavigate();

  // SECTION 2: STATE
  const [songData, setSongData] = useState(() => ({ 1: createNewBarData() }));
  const [currentFilename, setCurrentFilename] = useState('untitled_sequence');
  const [activeEditingJoint, setActiveEditingJoint] = useState(null);
  const [currentEditingBar, setCurrentEditingBar] = useState(1);
  const [appMode, setAppMode] = useState(MODE_SEQ);
  const [isPoseEditorModalOpen, setIsPoseEditorModalOpen] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [currentSequencerPlayBeat, setCurrentSequencerPlayBeat] = useState(0);
  const [currentPlayingBar, setCurrentPlayingBar] = useState(1);
  const [sequencerWasActive, setSequencerWasActive] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStartPoint, setLoopStartPoint] = useState(null);
  const [loopEndPoint, setLoopEndPoint] = useState(null);
  const [skipIntervalDenominator, setSkipIntervalDenominator] = useState(16);
  const [currentBarDisplayForPlayback, setCurrentBarDisplayForPlayback] = useState(1);
  const [currentBeatDisplayForPlayback, setCurrentBeatDisplayForPlayback] = useState(1);
  const [mainTimecodeParts, setMainTimecodeParts] = useState({ mm: '00', ss: '00', cs: '00' });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaType, setMediaType] = useState(null); 
  const [mediaDuration, setMediaDuration] = useState(0);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [isMediaActuallyPlaying, setIsMediaActuallyPlaying] = useState(false);
  const [isMediaMuted, setIsMediaMuted] = useState(false);
  const [mediaOriginalBPM, setMediaOriginalBPM] = useState('');
  const [isDetectingBPM, setIsDetectingBPM] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [soundsPreloaded, setSoundsPreloaded] = useState(false);
  const [currentSoundInBank, setCurrentSoundInBank] = useState(tr808SoundKeys[0] || null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [notationText, setNotationText] = useState({ shorthand: "N/A", plainEnglish: "N/A", analysis: "N/A" });
  const [currentKeyframes, setCurrentKeyframes] = useState([]);
  const [showSkeletonLines, setShowSkeletonLines] = useState(true);
  const [showMainCoreVisualizer, setShowMainCoreVisualizer] = useState(false);
  const [showMainPoseVisualizerAsOverlay, setShowMainPoseVisualizerAsOverlay] = useState(false);
  const [copiedBarData, setCopiedBarData] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedSoundKit, setSelectedSoundKit] = useState('TR-808');
  const soundKits = useMemo(() => ({
      'TR-808': { displayName: 'TR-808', sounds: tr808SoundKeys, fileMap: tr808SoundFiles },
      // 'DRUMBRUTE': { displayName: 'DrumBrute', sounds: drumBruteSoundKeys, fileMap: drumBruteSoundFiles }, // Example
  }), []);
  const [selectedSoundKitName, setSelectedSoundKitName] = useState(null);

  // SECTION 3: REFS
  const songDataRef = useRef(songData);
  const currentSequencerPlayBeatRef = useRef(currentSequencerPlayBeat);
  const currentPlayingBarRef = useRef(currentPlayingBar);
  const isSequencerPlayingRef = useRef(isSequencerPlaying);
  const isMediaActuallyPlayingRef = useRef(isMediaActuallyPlaying);
  const mediaInteractionRef = useRef(null);
  const sequencerTimerRef = useRef(null); 
  const tapTempoData = useRef({ timestamps: [], timer: null });
  const isLoopingRef = useRef(isLooping);
  const loopStartPointRef = useRef(loopStartPoint);
  const loopEndPointRef = useRef(loopEndPoint);
  const appModeRef = useRef(appMode);
  const bpmRef = useRef(contextBpm ?? DEFAULT_BPM);
  const timeSignatureRef = useRef(contextTimeSignature ?? DEFAULT_TIME_SIGNATURE);
  const currentFilenameRef = useRef(currentFilename);
  const mediaFileRef = useRef(mediaFile);
  const mediaSrcForCleanupRef = useRef(mediaSrc);
  const copiedBarDataRef = useRef(copiedBarData);
  const mainVisualizerAreaRef = useRef(null);
  const seqrFileInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const activeEditingJointRef = useRef(activeEditingJoint);
  const currentSoundInBankRef = useRef(currentSoundInBank);
  const currentEditingBarRefForKeyboard = useRef(currentEditingBar);

  const convertGlobalTickToBarBeat = useCallback((globalTick, songDataForCalc, musicalBeatsPerBar) => {
    const stepsPerBar = DEFAULT_NUM_BEATS_PER_BAR_CONST;
    if (globalTick === null || globalTick === undefined || globalTick < 0 || isNaN(globalTick)) return { bar: 1, beat: 0, tickInBar: 0, error: "Invalid globalTick value" };
    let remainingSteps = Math.floor(globalTick); let currentBarNum = 1;
    const songToUse = songDataForCalc || songDataRef.current; 
    const sortedBarKeys = Object.keys(songToUse).map(Number).filter(k => k >= 1 && Number.isInteger(k)).sort((a, b) => a - b);
    for (const barNum of sortedBarKeys) {
      while (currentBarNum < barNum) { if (remainingSteps < stepsPerBar) return { bar: currentBarNum, beat: remainingSteps, tickInBar: remainingSteps }; remainingSteps -= stepsPerBar; currentBarNum++; if (currentBarNum > MAX_BARS_ASSUMED) return { bar: MAX_BARS_ASSUMED, beat: 0, tickInBar: 0, error: "Exceeded max bars (hypothetical)"}; }
      const stepsInThisActualBar = songToUse[barNum]?.length || stepsPerBar;
      if (remainingSteps < stepsInThisActualBar) return { bar: barNum, beat: remainingSteps, tickInBar: remainingSteps };
      remainingSteps -= stepsInThisActualBar; currentBarNum = barNum + 1;
      if (currentBarNum > MAX_BARS_ASSUMED) return { bar: MAX_BARS_ASSUMED, beat: 0, tickInBar: 0, error: "Exceeded max bars (actual)"};
    }
    while (true) { if (remainingSteps < stepsPerBar) return { bar: currentBarNum, beat: remainingSteps, tickInBar: remainingSteps }; remainingSteps -= stepsPerBar; currentBarNum++; if (currentBarNum > MAX_BARS_ASSUMED) return { bar: MAX_BARS_ASSUMED, beat: Math.min(remainingSteps, stepsPerBar -1), tickInBar: Math.min(remainingSteps, stepsPerBar -1), error: "Exceeded max bars (extrapolation)" }; }
  }, []);

  // SECTION 4: UTILITY CALLBACKS
  const logToConsole = useCallback((message, ...args) => { console.log(`[SĒQsync SSC] ${message}`, ...args); }, []);
  const ensureAudioContextResumedAndInitialized = useCallback(async () => { if (audioContextRef.current && audioContextRef.current.state === 'running' && audioInitialized) return true; try { const ctx = await resumeAudioContext(); if (!ctx) throw new Error("AudioContext not available."); audioContextRef.current = ctx; if (ctx.state === 'running') { if (!audioInitialized) setAudioInitialized(true); return true; } else { if (audioInitialized) setAudioInitialized(false); return false; } } catch (error) { if (audioInitialized) setAudioInitialized(false); toast.error("Audio init. Try again or click page."); return false; } }, [audioInitialized, setAudioInitialized]);
  const calculateGlobalTick = useCallback((barBeatPoint) => { if (!barBeatPoint || typeof barBeatPoint.bar !== 'number' || typeof barBeatPoint.beat !== 'number' || barBeatPoint.bar < 1 || barBeatPoint.beat < 0 || isNaN(barBeatPoint.bar) || isNaN(barBeatPoint.beat)) return 0; const currentSong = songDataRef.current; const stepsPerBarForCalc = DEFAULT_NUM_BEATS_PER_BAR_CONST; let tick = 0; const sortedBarKeys = Object.keys(currentSong).map(Number).filter(k => k >=1).sort((a,b)=>a-b); for (const barNum of sortedBarKeys) { if (barNum < barBeatPoint.bar) tick += (currentSong[barNum]?.length || stepsPerBarForCalc); else break; } let lastKnownBar = sortedBarKeys.length > 0 ? Math.max(...sortedBarKeys) : 0; for (let i = lastKnownBar + 1; i < barBeatPoint.bar; i++) tick += stepsPerBarForCalc; tick += barBeatPoint.beat; return Math.max(0, tick); }, []);
  const packageToSEQFormatLocal = useCallback((currentStateForPackaging, titleOverride, descriptionOverride) => { const creationDate = new Date().toISOString(); const poSEQrNotationData = {}; let totalBarsForFile = 0; const { songData: csData = {}, bpm: currentBpm, timeSignature: currentTs, currentFilename: fName = 'untitled', mediaFile: mFile, mediaOriginalBPM: mOrigBPM = '', loopStartPoint: lStart, loopEndPoint: lEnd, currentKeyframes: keyframes } = currentStateForPackaging; const finalTempo = (currentBpm !== undefined && Number.isFinite(parseFloat(currentBpm))) ? parseFloat(currentBpm) : DEFAULT_BPM; const safeTs = { beatsPerBar: currentTs?.beatsPerBar || DEFAULT_TIME_SIGNATURE.beatsPerBar, beatUnit: currentTs?.beatUnit || DEFAULT_TIME_SIGNATURE.beatUnit }; const actualStepsPerBar = DEFAULT_NUM_BEATS_PER_BAR_CONST; const sortedBarKeys = Object.keys(csData).map(Number).filter(k => k >= 1 && Number.isInteger(k)).sort((a, b) => a - b); if (sortedBarKeys.length > 0) totalBarsForFile = Math.max(...sortedBarKeys); else totalBarsForFile = 1; for (let barNum = 1; barNum <= totalBarsForFile; barNum++) { const barDataArr = csData[barNum]; if (Array.isArray(barDataArr)) { poSEQrNotationData[`bar_${barNum}`] = barDataArr.map((beat, idx) => { const beatId = (beat && typeof beat.id === 'number' && beat.id >= 0 && beat.id < actualStepsPerBar) ? beat.id : idx; const safeBeat = (beat && typeof beat === 'object') ? beat : createDefaultBeatObject(beatId); const grounding = { L: safeBeat.grounding?.L || null, R: safeBeat.grounding?.R || null, L_weight: safeBeat.grounding?.L_weight !== undefined ? parseInt(safeBeat.grounding.L_weight, 10) : 50 }; return { beat: beatId + 1, id: beatId, states: safeBeat.jointInfo || {}, grounding, media_cue: (safeBeat.mediaCuePoint !== null && !isNaN(parseFloat(safeBeat.mediaCuePoint))) ? parseFloat(parseFloat(safeBeat.mediaCuePoint).toFixed(3)) : null, sounds_triggered: Array.isArray(safeBeat.sounds) ? safeBeat.sounds : [], syllable_cue: typeof safeBeat.syllable === 'string' ? safeBeat.syllable : null, head_alignment_target: typeof safeBeat.headOver === 'string' ? safeBeat.headOver : null }; }); while (poSEQrNotationData[`bar_${barNum}`].length < actualStepsPerBar) { const nextIdx = poSEQrNotationData[`bar_${barNum}`].length; poSEQrNotationData[`bar_${barNum}`].push({ ...createDefaultBeatObject(nextIdx), beat: nextIdx + 1 }); } poSEQrNotationData[`bar_${barNum}`] = poSEQrNotationData[`bar_${barNum}`].slice(0, actualStepsPerBar); } else { poSEQrNotationData[`bar_${barNum}`] = createNewBarData().map((b, i) => ({ ...b, beat: i + 1 })); } } return { version: "1.0.5", title: titleOverride || fName || "Untitled SĒQ", description: descriptionOverride || `Created ${creationDate}.`, creation_date_client: creationDate, last_modified_client: new Date().toISOString(), tempo: finalTempo, time_signature: `${safeTs.beatsPerBar}/${safeTs.beatUnit}`, total_bars: totalBarsForFile, audio_reference: { filename: mFile?.name || null, original_bpm_estimate: mOrigBPM ? parseInt(mOrigBPM, 10) : null }, video_reference: { filename: mFile?.type?.startsWith('video/') ? mFile.name : null, original_bpm_estimate: mFile?.type?.startsWith('video/') && mOrigBPM ? parseInt(mOrigBPM, 10) : null }, poSEQr_notation_data: poSEQrNotationData, custom_metadata: { client_app_version: "0.9.1", client_loop_start_bar_beat: lStart, client_loop_end_bar_beat: lEnd, client_keyframes_media_times_sec: Array.isArray(keyframes) ? keyframes.map(kf => parseFloat(kf.toFixed(3))).filter(kf => !isNaN(kf)).sort((a, b) => a - b) : [], client_media_original_bpm: mOrigBPM ? parseInt(mOrigBPM, 10) : null }, license_terms_placeholder: "Creator reserved.", thumbnail_reference_placeholder: null }; }, []);
  const makeAsyncHandler = useCallback((handlerName, handlerFn, criticalAudio = false) => { if (typeof handlerFn !== 'function') return async (...a) => {toast.error(`"${handlerName}" unavailable.`); logToConsole(`Uninit handler: ${handlerName}`,a);}; return async (...args) => { logToConsole(`[AsyncWrap] Attempting: ${handlerName}, CriticalAudio: ${criticalAudio}, AudioInitialized: ${audioInitialized}, CtxState: ${audioContextRef.current?.state}`); if (criticalAudio && (!audioInitialized || !audioContextRef.current || audioContextRef.current.state !== 'running')) { toast.warn("Audio init. Try again or click page.", { autoClose: 4000 }); ensureAudioContextResumedAndInitialized().catch(e => logToConsole("Async EnsureAudioCtx err:", e)); return; } try { logToConsole(`[AsyncWrap] Executing: ${handlerName}`); return await handlerFn(...args); } catch (e) { logToConsole(`ERR in "${handlerName}":`, e.message, e.stack); toast.error(`"${handlerName}" fail: ${String(e.message).substring(0,100)}`); } }; }, [audioInitialized, ensureAudioContextResumedAndInitialized, logToConsole]);

  // SECTION 5: MEMOS
  const memoizedEmptyArray = useMemo(() => [], []);
  const totalBars = useMemo(() => { const k = Object.keys(songDataRef.current || {}).map(Number).filter(n => n >= 1 && Number.isInteger(n)); return k.length > 0 ? Math.max(1, ...k) : 1; }, [songData]);
  const globalLoopStartTick = useMemo(() => loopStartPointRef.current ? calculateGlobalTick(loopStartPointRef.current) : null, [loopStartPoint, calculateGlobalTick]);
  const globalLoopEndTick = useMemo(() => loopEndPointRef.current ? calculateGlobalTick(loopEndPointRef.current) : null, [loopEndPoint, calculateGlobalTick]);
  const currentBarDataForGrid = useMemo(() => {
      logToConsole(`[SSC] Recomputing currentBarDataForGrid for bar: ${currentEditingBar}`);
      return songData[currentEditingBar] || createNewBarData();
  }, [currentEditingBar, songData]);
  const numRowsForGrid = useMemo(() => Math.ceil(DEFAULT_NUM_BEATS_PER_BAR_CONST / BEATS_PER_ROW_DISPLAY), []);
  const displayBarForUI = useMemo(() => (isSequencerPlayingRef.current || sequencerWasActive) ? currentPlayingBarRef.current : (currentEditingBar || 1), [isSequencerPlaying, sequencerWasActive, currentPlayingBar, currentEditingBar]);
  const displayBeatIndexForUI = useMemo(() => { const bD = songDataRef.current[displayBarForUI] || []; const bLen = bD.length || DEFAULT_NUM_BEATS_PER_BAR_CONST; const rawIdx = (isSequencerPlayingRef.current || sequencerWasActive) ? currentSequencerPlayBeatRef.current : (activeBeatIndex !== null ? activeBeatIndex : 0); return Math.max(0, Math.min(rawIdx, bLen > 0 ? bLen - 1 : 0)); }, [isSequencerPlaying, sequencerWasActive, currentSequencerPlayBeat, activeBeatIndex, displayBarForUI, songData]);
  const beatDataForUIDisplay = useMemo(() => { const bD = songDataRef.current[displayBarForUI] || []; return bD[displayBeatIndexForUI] || createDefaultBeatObject(displayBeatIndexForUI); }, [displayBarForUI, displayBeatIndexForUI, songData]);
  const beatDataForModal = useMemo(() => { if (appModeRef.current === MODE_POS && activeBeatIndex !== null && currentEditingBar) { const b = songDataRef.current[currentEditingBar] || []; return { ...(b[activeBeatIndex] || createDefaultBeatObject(activeBeatIndex)), barNumber: currentEditingBar, id: activeBeatIndex }; } return {...createDefaultBeatObject(0), barNumber: 1, id: 0 }; }, [appMode, activeBeatIndex, currentEditingBar, songData]);
  const programmedJointsForUI = useMemo(() => { const joints = new Set(); if (beatDataForUIDisplay && beatDataForUIDisplay.jointInfo) { Object.keys(beatDataForUIDisplay.jointInfo).forEach(jointKey => joints.add(jointKey)); } return Array.from(joints); }, [beatDataForUIDisplay]);
  const { leftFootGroundingForUI, rightFootGroundingForUI, leftFootRotationForUI, rightFootRotationForUI } = useMemo(() => {
    const g = beatDataForUIDisplay?.grounding;
    const jI = beatDataForUIDisplay?.jointInfo;
    const lAnkleKey = UI_LEFT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('ANK'))?.abbrev;
    const rAnkleKey = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('ANK'))?.abbrev;
    return {
      leftFootGroundingForUI: g?.L || memoizedEmptyArray,
      rightFootGroundingForUI: g?.R || memoizedEmptyArray,
      leftFootRotationForUI: (lAnkleKey && jI?.[lAnkleKey]?.rotation !== undefined) ? jI[lAnkleKey].rotation : 0,
      rightFootRotationForUI: (rAnkleKey && jI?.[rAnkleKey]?.rotation !== undefined) ? jI[rAnkleKey].rotation : 0,
    };
  }, [beatDataForUIDisplay, memoizedEmptyArray]);

  const soundKitsData = useMemo(() => ({
      'TR-808': { 
          displayName: 'TR-808', 
          soundKeys: tr808SoundKeys, // from ../../../utils/sounds
          fileMap: tr808SoundFiles    // from ../../../utils/sounds
      },
      // Example for another kit:
      // 'DRUMBRUTE': { 
      //     displayName: 'DrumBrute Classics', 
      //     soundKeys: ['DB_Kick_01', 'DB_Snare_03', ...], 
      //     fileMap: { 'DB_Kick_01': '/path/to/db_kick01.wav', ... }
      // },
  }), []); // Empty array means this map itself is stable

  const handleKitSelect = useCallback((kitName) => {
      setSelectedSoundKitName(kitName);
      // When a kit is selected, automatically select its first sound (or null if kit is empty)
      const firstSoundInKit = soundKitsData[kitName]?.soundKeys?.[0] || null;
      setCurrentSoundInBank(firstSoundInKit); // currentSoundInBank now stores the key of the sound within the kit
      logToConsole(`[SSC] Kit selected: ${kitName}, first sound: ${firstSoundInKit}`);
  }, [soundKitsData, setCurrentSoundInBank, logToConsole]);

  // SECTION 6: CORE HANDLERS
  const coreHandleDetectMediaBPM = useCallback(async (fileToProcess) => { logToConsole("[coreHandleDetectMediaBPM] Initiated."); const file = fileToProcess || mediaFileRef.current; if (!file) { toast.warn("No media file for BPM detect."); return; } if (!(await ensureAudioContextResumedAndInitialized())) return; setIsDetectingBPM(true); try { const detected = await detectBPMFromFile(file); if (detected) { const rounded = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(detected))); setMediaOriginalBPM(String(rounded)); toast.success(`Detected BPM: ~${rounded}.`); } else { toast.error("Could not detect BPM."); setMediaOriginalBPM(''); } } catch (error) { toast.error(`BPM detect error: ${error.message}`); setMediaOriginalBPM(''); } finally { setIsDetectingBPM(false); } }, [ensureAudioContextResumedAndInitialized, logToConsole]);
  const coreHandleIntervalSkip = useCallback((directionOrSeekEvent) => { logToConsole("[coreHandleIntervalSkip] Initiated.", directionOrSeekEvent); const wasPlaying = isSequencerPlayingRef.current; if (wasPlaying) setIsSequencerPlaying(false); if (!sequencerWasActive) setSequencerWasActive(true); const currentSong = songDataRef.current; const currentTs = timeSignatureRef.current; const currentGlobalTickVal = calculateGlobalTick({ bar: currentPlayingBarRef.current, beat: currentSequencerPlayBeatRef.current }); let newGlobalTickTarget = currentGlobalTickVal; if (typeof directionOrSeekEvent === 'number') { const direction = directionOrSeekEvent; const stepsInCurrentBar = currentSong[currentPlayingBarRef.current]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST; const mainBeatsInBar = currentTs.beatsPerBar; const subdivisionsPerMainBeat = mainBeatsInBar > 0 ? stepsInCurrentBar / mainBeatsInBar : stepsInCurrentBar; const stepsToSkipVal = Math.max(1, Math.round((currentTs.beatUnit / skipIntervalDenominator) * subdivisionsPerMainBeat)); newGlobalTickTarget = currentGlobalTickVal + (direction * stepsToSkipVal); } else if (typeof directionOrSeekEvent === 'object') { const seekEvent = directionOrSeekEvent; if (seekEvent.type === 'tick') { newGlobalTickTarget = seekEvent.value; } else if (seekEvent.type === 'time' && appModeRef.current === MODE_SYNC && mediaInteractionRef.current && mediaDuration > 0) { const targetMediaTime = Math.max(0, Math.min(seekEvent.value, mediaDuration - 0.001)); if (Math.abs(mediaInteractionRef.current.currentTime - targetMediaTime) > 0.05) mediaInteractionRef.current.currentTime = targetMediaTime; if (wasPlaying) setIsSequencerPlaying(true); return; } else { if (wasPlaying) setIsSequencerPlaying(true); return; } } else { if (wasPlaying) setIsSequencerPlaying(true); return; } const totalStepsInSong = Object.values(currentSong).reduce((sum, barArr) => sum + (barArr?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST), 0) || DEFAULT_NUM_BEATS_PER_BAR_CONST; const loopActive = isLoopingRef.current; const startTickVal = globalLoopStartTick; const endTickVal = globalLoopEndTick; if (loopActive && startTickVal !== null && endTickVal !== null && startTickVal <= endTickVal) { const loopLength = endTickVal - startTickVal + 1; if (loopLength > 0) { if (newGlobalTickTarget > endTickVal) newGlobalTickTarget = startTickVal + (newGlobalTickTarget - (endTickVal + 1)) % loopLength; else if (newGlobalTickTarget < startTickVal) newGlobalTickTarget = endTickVal - ((startTickVal - 1 - newGlobalTickTarget) % loopLength); } else { newGlobalTickTarget = Math.max(0, Math.min(newGlobalTickTarget, totalStepsInSong > 0 ? totalStepsInSong - 1 : 0)); } } else { newGlobalTickTarget = Math.max(0, Math.min(newGlobalTickTarget, totalStepsInSong > 0 ? totalStepsInSong - 1 : 0)); } const { bar: finalTargetBar, beat: finalTargetBeatIndex } = convertGlobalTickToBarBeat(newGlobalTickTarget, currentSong, DEFAULT_NUM_BEATS_PER_BAR_CONST); setCurrentPlayingBar(finalTargetBar); setCurrentSequencerPlayBeat(finalTargetBeatIndex); if (!wasPlaying) { setCurrentEditingBar(finalTargetBar); setActiveBeatIndex(finalTargetBeatIndex); } if (appModeRef.current === MODE_SYNC && mediaInteractionRef.current && mediaDuration > 0 && (typeof directionOrSeekEvent === 'number' || (typeof directionOrSeekEvent === 'object' && directionOrSeekEvent.type === 'tick'))) { const effectiveBPM = parseFloat(mediaOriginalBPM) || bpmRef.current; const mainBeatUnit = currentTs.beatUnit || 4; const stepsPerMainBeatForSync = currentTs.beatsPerBar > 0 ? (currentSong[finalTargetBar]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) / currentTs.beatsPerBar : (currentSong[finalTargetBar]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) ; const mainBeatsInBar = currentTs.beatsPerBar; if (effectiveBPM > 0 && stepsPerMainBeatForSync > 0) { const secondsPerMainBeat = 60 / effectiveBPM; const secondsPerSequencerStep = mainBeatsInBar > 0 ? secondsPerMainBeat / stepsPerMainBeatForSync : 0; if (secondsPerSequencerStep > 0 && isFinite(secondsPerSequencerStep)) { const targetMediaTimeSeconds = Math.max(0, Math.min(newGlobalTickTarget * secondsPerSequencerStep, mediaDuration - 0.001)); if (Math.abs(mediaInteractionRef.current.currentTime - targetMediaTimeSeconds) > 0.1) mediaInteractionRef.current.currentTime = targetMediaTimeSeconds; } } } if (appModeRef.current !== MODE_SYNC || (typeof directionOrSeekEvent === 'object' && directionOrSeekEvent.type === 'tick')) { const mainBeatUnitTC = currentTs.beatUnit || 4; const internalTicksPerMainBeatTC = mainBeatUnitTC > 0 ? INTERNAL_SEQUENCER_RESOLUTION / mainBeatUnitTC : 0; if (bpmRef.current > 0 && internalTicksPerMainBeatTC > 0 && isFinite(internalTicksPerMainBeatTC)) { const secondsPerInternalTickTC = (60 / bpmRef.current) / internalTicksPerMainBeatTC; const stepsPerMainBeatForTC = currentTs.beatsPerBar > 0 ? (currentSong[finalTargetBar]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) / (currentTs.beatsPerBar || 4) : (currentSong[finalTargetBar]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) ; const internalResTicksPerStep = stepsPerMainBeatForTC > 0 ? INTERNAL_SEQUENCER_RESOLUTION / stepsPerMainBeatForTC : 0; const totalInternalResTicksAtNewPos = newGlobalTickTarget * internalResTicksPerStep; if (secondsPerInternalTickTC >= 0 && isFinite(secondsPerInternalTickTC)) { const totalSecondsAtNewPos = totalInternalResTicksAtNewPos * secondsPerInternalTickTC; if (isFinite(totalSecondsAtNewPos) && totalSecondsAtNewPos >=0) { const m = Math.floor(totalSecondsAtNewPos / 60); const s = Math.floor(totalSecondsAtNewPos % 60); const cs = Math.floor((totalSecondsAtNewPos * 100) % 100); setMainTimecodeParts({ mm: String(m).padStart(2, '0'), ss: String(s).padStart(2, '0'), cs: String(cs).padStart(2, '0') }); } } } } if (wasPlaying) setIsSequencerPlaying(true); }, [skipIntervalDenominator, mediaOriginalBPM, mediaDuration, sequencerWasActive, calculateGlobalTick, convertGlobalTickToBarBeat, globalLoopStartTick, globalLoopEndTick, logToConsole]);
  
  // Ensure coreHandleSeek is defined HERE, before it's used by handleSeekAction
  const coreHandleSeek = useCallback((seekEvent) => { 
    logToConsole("[coreHandleSeek] Initiated.", seekEvent); 
    coreHandleIntervalSkip(seekEvent); 
  }, [coreHandleIntervalSkip, logToConsole]);

  const coreHandleModeChange = useCallback((newMode) => { logToConsole(`[coreHandleModeChange] To ${newMode}, From ${appModeRef.current}`); if (appModeRef.current === newMode) return; setAppMode(newMode); if (appModeRef.current === MODE_SYNC && newMode !== MODE_SYNC && mediaInteractionRef.current && !mediaInteractionRef.current.paused) mediaInteractionRef.current.pause(); if (appModeRef.current === MODE_POS && newMode !== MODE_POS) { setActiveEditingJoint(null); } }, [logToConsole]);
  const coreHandleSoundBankSelect = useCallback(async (soundKey) => { logToConsole(`[coreHandleSoundBankSelect] Sound key: ${soundKey}`); setCurrentSoundInBank(soundKey); if (await ensureAudioContextResumedAndInitialized() && soundsPreloaded && tr808SoundFiles[soundKey]) { managerPlaySound(tr808SoundFiles[soundKey], { volume: 0.7 }); logToConsole(`[coreHandleSoundBankSelect] Played preview for ${soundKey}`); } else {logToConsole(`[coreHandleSoundBankSelect] Did NOT play preview for ${soundKey}. AudioReady: ${audioInitialized}, SoundsPreloaded: ${soundsPreloaded}`);} }, [soundsPreloaded, ensureAudioContextResumedAndInitialized, logToConsole]);
  
  const coreHandleJointSelect = useCallback((jointAbbrev) => {
    logToConsole(`[coreHandleJointSelect] Joint: ${jointAbbrev}, AppMode: ${appModeRef.current}, Current ActiveBeatIndex: ${activeBeatIndex}`);
    setActiveEditingJoint(jointAbbrev);
    if (appModeRef.current === MODE_POS) {
        const beatIdxForModal = activeBeatIndex === null ? 0 : activeBeatIndex;
        if (activeBeatIndex === null) {
            logToConsole(`[coreHandleJointSelect] No active beat previously selected, defaulting to beat 0 for joint ${jointAbbrev} modal.`);
            setActiveBeatIndex(0); 
        } else {
            logToConsole(`[coreHandleJointSelect] Using existing activeBeatIndex: ${activeBeatIndex} for joint ${jointAbbrev} modal.`);
        }
        setIsPoseEditorModalOpen(true);
    }
  }, [activeBeatIndex, logToConsole]); 
  const coreHandleTimeSignatureChange = useCallback((newTimeSignatureSettings) => { logToConsole("[coreHandleTimeSignatureChange]", newTimeSignatureSettings); const newBeats = parseInt(newTimeSignatureSettings.beatsPerBar, 10); const newUnit = parseInt(newTimeSignatureSettings.beatUnit, 10); if (isNaN(newBeats) || isNaN(newUnit) || newBeats < 1 || newBeats > MAX_BEATS_PER_BAR_HARD_LIMIT || ![2, 4, 8, 16, 32].includes(newUnit)) { toast.error("Invalid time signature values selected."); return; } const validatedTimeSignature = { beatsPerBar: newBeats, beatUnit: newUnit }; if (timeSignatureRef.current.beatsPerBar === validatedTimeSignature.beatsPerBar && timeSignatureRef.current.beatUnit === validatedTimeSignature.beatUnit) return; setContextTimeSignature(validatedTimeSignature); toast.info(`Time signature updated to ${validatedTimeSignature.beatsPerBar}/${validatedTimeSignature.beatUnit}.`); }, [setContextTimeSignature, logToConsole]);
  const coreHandleBpmChange = useCallback((newBpmStr) => { logToConsole("[coreHandleBpmChange]", newBpmStr); const newBpmNum = parseFloat(newBpmStr); if (!isNaN(newBpmNum)) { const clampedBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, newBpmNum)); if (clampedBpm !== bpmRef.current) { setContextBpm(clampedBpm); if (mediaInteractionRef.current && mediaOriginalBPM && Number(mediaOriginalBPM) > 0) mediaInteractionRef.current.playbackRate = clampedBpm / Number(mediaOriginalBPM); } } else toast.warn("Invalid BPM value."); }, [setContextBpm, mediaOriginalBPM, logToConsole]);
  const coreHandleMediaOriginalBPMChange = useCallback((newOrigBpmStr) => { logToConsole("[coreHandleMediaOriginalBPMChange]", newOrigBpmStr); setMediaOriginalBPM(newOrigBpmStr); const numOrigBPM = parseFloat(newOrigBpmStr); if (mediaInteractionRef.current && !isNaN(numOrigBPM) && numOrigBPM > 0 && contextBpm) mediaInteractionRef.current.playbackRate = contextBpm / numOrigBPM; else if (mediaInteractionRef.current) mediaInteractionRef.current.playbackRate = 1.0; }, [contextBpm, logToConsole]);
  const coreHandleSkipIntervalChange = useCallback((newDenom) => { logToConsole("[coreHandleSkipIntervalChange]", newDenom); setSkipIntervalDenominator(parseInt(newDenom, 10)); }, [logToConsole]);
  const coreHandleToggleShift = useCallback(() => { logToConsole("[coreHandleToggleShift]"); setIsShiftActive(p => !p); }, [logToConsole]);
  const coreHandlePlayPause = useCallback(async () => { logToConsole("[coreHandlePlayPause] Initiated."); const currentAppMode = appModeRef.current; const isCurrentlyPlaying = isSequencerPlayingRef.current; if (!isCurrentlyPlaying) { if (!(await ensureAudioContextResumedAndInitialized()) && currentAppMode !== MODE_SYNC) return; if (currentAppMode !== MODE_SYNC && !soundsPreloaded) { toast.error("Sounds not preloaded."); return; } if (currentAppMode === MODE_SYNC && !mediaSrcForCleanupRef.current) { toast.error("No media for SYNC."); return; } if (!sequencerWasActive) { setCurrentPlayingBar(currentEditingBarRefForKeyboard.current || 1); setCurrentSequencerPlayBeat(activeBeatIndex ?? 0); setSequencerWasActive(true); } if (currentAppMode === MODE_SYNC && mediaInteractionRef.current && mediaSrcForCleanupRef.current) { if (mediaInteractionRef.current.paused) { const currentTick = calculateGlobalTick({ bar: currentPlayingBarRef.current, beat: currentSequencerPlayBeatRef.current }); const effBPM = parseFloat(mediaOriginalBPM) || bpmRef.current; const stepsPerMainBeatForSync = timeSignatureRef.current.beatsPerBar > 0 ? (songDataRef.current[currentPlayingBarRef.current]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) / timeSignatureRef.current.beatsPerBar : (songDataRef.current[currentPlayingBarRef.current]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST); if (effBPM > 0 && stepsPerMainBeatForSync > 0 && mediaDuration > 0) { const secondsPerSequencerStep = (60 / effBPM) / stepsPerMainBeatForSync; const correctTargetMediaTime = Math.min(mediaDuration - 0.001, Math.max(0, currentTick * secondsPerSequencerStep)); if (Math.abs(mediaInteractionRef.current.currentTime - correctTargetMediaTime) > 0.1) mediaInteractionRef.current.currentTime = correctTargetMediaTime; } mediaInteractionRef.current.play().catch(e => {toast.error("Media play failed."); setIsSequencerPlaying(false);}); } } setIsSequencerPlaying(true); } else { setIsSequencerPlaying(false); if (currentAppMode === MODE_SYNC && mediaInteractionRef.current && !mediaInteractionRef.current.paused) mediaInteractionRef.current.pause(); } }, [ensureAudioContextResumedAndInitialized, soundsPreloaded, sequencerWasActive, activeBeatIndex, mediaOriginalBPM, mediaDuration, calculateGlobalTick, logToConsole]);
  const coreHandleStop = useCallback(async () => { logToConsole("[coreHandleStop] Initiated."); if (isSequencerPlayingRef.current) setIsSequencerPlaying(false); setSequencerWasActive(false); if (mediaInteractionRef.current) { mediaInteractionRef.current.pause(); mediaInteractionRef.current.currentTime = 0; } const barToReset = currentEditingBarRefForKeyboard.current || 1; const beatToReset = 0; setCurrentPlayingBar(barToReset); setCurrentSequencerPlayBeat(beatToReset); if (appModeRef.current === MODE_SYNC && mediaSrcForCleanupRef.current) { setMainTimecodeParts({ mm: '00', ss: '00', cs: '00' }); } else { const ticksAtR = calculateGlobalTick({ bar: barToReset, beat: beatToReset }); const mainBU = timeSignatureRef.current.beatUnit || 4; const internalTicksPerMainBeat = mainBU > 0 ? INTERNAL_SEQUENCER_RESOLUTION / mainBU : 0; if (bpmRef.current > 0 && internalTicksPerMainBeat > 0 && isFinite(internalTicksPerMainBeat)) { const secondsPerInternalTick = (60 / bpmRef.current) / internalTicksPerMainBeat; const stepsPerMainBeatForTC = timeSignatureRef.current.beatsPerBar > 0 ? (songDataRef.current[barToReset]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) / (timeSignatureRef.current.beatsPerBar || 4) : (songDataRef.current[barToReset]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST); const internalResTicksPerStep = stepsPerMainBeatForTC > 0 ? INTERNAL_SEQUENCER_RESOLUTION / stepsPerMainBeatForTC : 0; const totalInternalResTicksAtReset = ticksAtR * internalResTicksPerStep; const totalSeconds = totalInternalResTicksAtReset * secondsPerInternalTick; if (isFinite(totalSeconds) && totalSeconds >= 0) { const m=Math.floor(totalSeconds/60); const s=Math.floor(totalSeconds%60); const cs=Math.floor((totalSeconds*100)%100); setMainTimecodeParts({mm:String(m).padStart(2,'0'),ss:String(s).padStart(2,'0'),cs:String(cs).padStart(2,'0')}); } else setMainTimecodeParts({mm:'00',ss:'00',cs:'00'}); } else setMainTimecodeParts({mm:'00',ss:'00',cs:'00'}); } }, [calculateGlobalTick, logToConsole]);
  const coreHandleTapTempo = useCallback(() => { logToConsole("[coreHandleTapTempo] Tap!"); const now = performance.now(); tapTempoData.current.timestamps.push(now); while (tapTempoData.current.timestamps.length > (TAP_TEMPO_MIN_TAPS + 1) && tapTempoData.current.timestamps.length > 4) tapTempoData.current.timestamps.shift(); if (tapTempoData.current.timer) clearTimeout(tapTempoData.current.timer); tapTempoData.current.timer = setTimeout(() => { tapTempoData.current.timestamps = []; tapTempoData.current.timer = null; }, TAP_TEMPO_MAX_INTERVAL_MS * 2); if (tapTempoData.current.timestamps.length >= TAP_TEMPO_MIN_TAPS) { const intervals = []; for (let i = 1; i < tapTempoData.current.timestamps.length; i++) { const interval = tapTempoData.current.timestamps[i] - tapTempoData.current.timestamps[i-1]; if (interval < TAP_TEMPO_MAX_INTERVAL_MS) intervals.push(interval); else { tapTempoData.current.timestamps = [now]; return; } } if (intervals.length >= TAP_TEMPO_MIN_TAPS - 1) { const avgInterval = intervals.reduce((s,v)=>s+v,0)/intervals.length; if (avgInterval > 0) { const newBPM = 60000 / avgInterval; coreHandleBpmChange(String(newBPM)); if (appModeRef.current === MODE_SYNC && mediaSrcForCleanupRef.current) setMediaOriginalBPM(String(Math.round(newBPM))); toast.info(`Tempo: ${Math.round(newBPM)} BPM`); } } } }, [coreHandleBpmChange, setMediaOriginalBPM, logToConsole]);
  const coreHandleFileSelected = useCallback(async (file, specificFileInputRef) => { logToConsole("[coreHandleFileSelected]", file ? file.name : "No file"); const inputRef = specificFileInputRef || mediaFileInputRef.current; if (mediaSrcForCleanupRef.current?.startsWith('blob:')) { URL.revokeObjectURL(mediaSrcForCleanupRef.current); mediaSrcForCleanupRef.current = null; } setMediaFile(null); setMediaSrc(null); setMediaType(null); setMediaDuration(0); setMediaCurrentTime(0); setMediaOriginalBPM(''); setCurrentKeyframes([]); setMainTimecodeParts({mm:'00',ss:'00',cs:'00'}); setIsDetectingBPM(false); if (file) { if (file.name.toLowerCase().endsWith('.seqr')) { toast.error(`"${file.name}" is project. Use Load Project.`); if (inputRef) inputRef.value = null; return; } const newObjUrl = URL.createObjectURL(file); setMediaFile(file); setMediaSrc(newObjUrl); mediaSrcForCleanupRef.current = newObjUrl; const dMT = file.type.startsWith('audio/') ? 'audio' : (file.type.startsWith('video/') ? 'video' : null); setMediaType(dMT); if (appModeRef.current === MODE_SYNC && isSequencerPlayingRef.current) await coreHandleStop(); toast.success(`Media "${file.name}" loaded.`); if (dMT && await ensureAudioContextResumedAndInitialized()) coreHandleDetectMediaBPM(file); } else { if (appModeRef.current === MODE_SYNC && isSequencerPlayingRef.current) await coreHandleStop(); } if (inputRef) inputRef.value = null; }, [coreHandleStop, coreHandleDetectMediaBPM, ensureAudioContextResumedAndInitialized, logToConsole]);
    // In StepSequencerControls.jsx

  const coreHandleBeatClick = useCallback(async (beatIdxToMakeActive) => {
    const currentBarForThisClick = currentEditingBarRefForKeyboard.current; // Use the ref for bar context at time of click intent
    const currentAppMode = appModeRef.current; // Use ref for app mode at time of click intent

    logToConsole(
      `[coreHandleBeatClick] Beat Idx: ${beatIdxToMakeActive}, Bar: ${currentBarForThisClick}, Mode: ${currentAppMode}`
    );

    setActiveBeatIndex(beatIdxToMakeActive); // Update state for UI selection

    if (currentAppMode === MODE_POS) {
      logToConsole(`[coreHandleBeatClick - POS] Opening Pose Editor Modal for Beat ${beatIdxToMakeActive + 1}`);
      setIsPoseEditorModalOpen(true);
    } else if (currentAppMode === MODE_SEQ) {
      const audioReady = await ensureAudioContextResumedAndInitialized();
      logToConsole(
        `[coreHandleBeatClick - SEQ] Attempting to play sounds. AudioReady: ${audioReady}, SoundsPreloaded: ${soundsPreloaded}`
      );
      if (audioReady && soundsPreloaded) {
        // Access songData directly through its ref for the most current data,
        // as this callback might not re-create if only songData changes but other deps don't.
        const soundsOnThisBeat = songDataRef.current[currentBarForThisClick]?.[beatIdxToMakeActive]?.sounds;
        logToConsole(
          `[coreHandleBeatClick - SEQ] Sounds for Beat ${beatIdxToMakeActive + 1} in Bar ${currentBarForThisClick}:`,
          JSON.stringify(soundsOnThisBeat)
        );
        if (soundsOnThisBeat && soundsOnThisBeat.length > 0) {
          soundsOnThisBeat.forEach(key => {
            if (tr808SoundFiles[key]) {
              logToConsole(`[coreHandleBeatClick - SEQ] Playing sound: ${key}`);
              managerPlaySound(tr808SoundFiles[key]);
            } else {
              logToConsole(
                `[coreHandleBeatClick - SEQ] Sound key ${key} not found in tr808SoundFiles.`
              );
            }
          });
        } else {
          logToConsole(`[coreHandleBeatClick - SEQ] No sounds to play on this beat.`);
        }
      }
    }

    // Handle SYNC mode seeking or updating playhead for non-playing sequencer
    if (currentAppMode === MODE_SYNC && mediaInteractionRef.current && mediaDuration > 0) {
      const globalTickForSeek = calculateGlobalTick({
        bar: currentBarForThisClick,
        beat: beatIdxToMakeActive
      });
      logToConsole(
        `[coreHandleBeatClick - SYNC] Seeking media to global tick: ${globalTickForSeek}`
      );
      coreHandleSeek({ type: 'tick', value: globalTickForSeek }); // coreHandleSeek is already a useCallback
    } else if (!isSequencerPlayingRef.current) {
      // If not playing and not in SYNC mode (or SYNC without media),
      // set the "shadow" playhead to this clicked beat/bar.
      logToConsole(
        `[coreHandleBeatClick] Sequencer not playing. Setting playhead to Bar: ${currentBarForThisClick}, Beat: ${beatIdxToMakeActive + 1}`
      );
      setCurrentPlayingBar(currentBarForThisClick);
      setCurrentSequencerPlayBeat(beatIdxToMakeActive);
    }
  }, [
    // Dependencies:
    // State setters are stable.
    // Refs (.current) are accessed, their values might change, but the ref objects themselves are stable.
    // Callbacks from parent/useMemo should be stable if their own dependencies are correct.
    soundsPreloaded, // state
    mediaDuration,   // state
    calculateGlobalTick, // memoized callback
    coreHandleSeek,      // memoized callback
    ensureAudioContextResumedAndInitialized, // memoized callback
    logToConsole,        // memoized callback
    setActiveBeatIndex,  // state setter
    setIsPoseEditorModalOpen, // state setter
    setCurrentPlayingBar,   // state setter
    setCurrentSequencerPlayBeat // state setter
    // managerPlaySound is stable (import)
    // tr808SoundFiles is stable (import)
  ]);

  const coreHandleAddSoundToBeat = useCallback(async (targetBeatIdx) => {
    const soundKeyToAdd = currentSoundInBank; // From state
    // ... (initial guards for appMode, soundKeyToAdd, audio, preloads) ...
    logToConsole(`[CoreAddSound] Attempt. Beat: ${targetBeatIdx + 1}, Bar: ${currentEditingBar}, Sound: ${soundKeyToAdd}`);

    if (appMode !== MODE_SEQ || !soundKeyToAdd || !(await ensureAudioContextResumedAndInitialized()) || !soundsPreloaded) {
      // Consolidated guards log their own specific messages
      return;
    }

    setSongData(prevSongData => {
      // 1. Create a new top-level songData object
      const newSongData = { ...prevSongData };

      // 2. Get or create a new array for the target bar
      const barDataArrayCopy = newSongData[currentEditingBar] ? [...newSongData[currentEditingBar]] : createNewBarData();
      
      // 3. Get or create a new object for the target beat
      const beatObjectCopy = barDataArrayCopy[targetBeatIdx] ? { ...barDataArrayCopy[targetBeatIdx] } : createDefaultBeatObject(targetBeatIdx);

      // 4. Ensure 'sounds' array exists and create a new one for modification
      const currentSoundsOnBeat = Array.isArray(beatObjectCopy.sounds) ? [...beatObjectCopy.sounds] : [];

      if (!currentSoundsOnBeat.includes(soundKeyToAdd) && currentSoundsOnBeat.length < MAX_SOUNDS_PER_BEAT) {
        currentSoundsOnBeat.push(soundKeyToAdd); // Modify the copy
        beatObjectCopy.sounds = currentSoundsOnBeat; // Assign the new array to the copied beat object

        // 5. Place the modified (newly referenced) beat object back into the copied bar array
        barDataArrayCopy[targetBeatIdx] = beatObjectCopy;
        
        // 6. Place the modified (newly referenced) bar array back into the new songData object
        newSongData[currentEditingBar] = barDataArrayCopy;

        logToConsole(`[CoreAddSound] Updater: Sound "${soundKeyToAdd}" added to Bar ${currentEditingBar}, Beat ${targetBeatIdx + 1}. New sounds:`, JSON.stringify(beatObjectCopy.sounds));
        
        // Play sound optimistically here, as we've confirmed it's being added to the structure for this update
        if (tr808SoundFiles[soundKeyToAdd]) {
          managerPlaySound(tr808SoundFiles[soundKeyToAdd]);
        }
        return newSongData; // Return the new songData object
      } else {
        // Handle cases where sound is already there or limit is reached
        if (currentSoundsOnBeat.includes(soundKeyToAdd)) {
          toast.info(`Sound "${getSoundNameFromPath(soundKeyToAdd)}" is already on this beat.`);
        } else {
          toast.warn(`Maximum ${MAX_SOUNDS_PER_BEAT} sounds per beat reached.`);
        }
        return prevSongData; // No change made, return the original state to prevent unnecessary re-render
      }
    });
  }, [
    currentEditingBar, appMode, currentSoundInBank, soundsPreloaded, 
    ensureAudioContextResumedAndInitialized, setSongData, logToConsole, 
    // managerPlaySound and tr808SoundFiles are stable imports
  ]);

  const coreHandleDeleteSoundFromBeat = useCallback((targetBeatIdx, soundKeyToDelete) => { logToConsole("[coreHandleDeleteSoundFromBeat]", targetBeatIdx, soundKeyToDelete); const barToEdit = currentEditingBarRefForKeyboard.current; if (appModeRef.current !== MODE_SEQ) return; setSongData(p => { const nS = JSON.parse(JSON.stringify(p)); const snds = nS[barToEdit]?.[targetBeatIdx]?.sounds; if (snds) nS[barToEdit][targetBeatIdx].sounds = snds.filter(s => s !== soundKeyToDelete); return nS; }); toast.info(`Sound "${getSoundNameFromPath(soundKeyToDelete)}" removed.`); }, [logToConsole]);
  const coreHandleNextBar = useCallback(() => { logToConsole("[coreHandleNextBar]"); const newEdBar = Math.min(totalBars, currentEditingBar + 1); if (newEdBar === currentEditingBar && currentEditingBar === totalBars && !isSequencerPlayingRef.current); else { setCurrentEditingBar(newEdBar); setActiveBeatIndex(0); if (!isSequencerPlayingRef.current) { setCurrentPlayingBar(newEdBar); setCurrentSequencerPlayBeat(0); } } }, [currentEditingBar, totalBars, logToConsole]);
  const coreHandlePrevBar = useCallback(() => { logToConsole("[coreHandlePrevBar]"); const newEdBar = Math.max(1, currentEditingBar - 1); setCurrentEditingBar(newEdBar); setActiveBeatIndex(0); if (!isSequencerPlayingRef.current) { setCurrentPlayingBar(newEdBar); setCurrentSequencerPlayBeat(0); } }, [currentEditingBar, logToConsole]);
  const coreHandleAddBar = useCallback(() => { logToConsole("[coreHandleAddBar]"); const newBarNum = totalBars + 1; if (newBarNum > MAX_BARS_ASSUMED) { toast.error(`Max bars ${MAX_BARS_ASSUMED} reached.`); return; } setSongData(p => ({ ...p, [newBarNum]: createNewBarData() })); setCurrentEditingBar(newBarNum); setActiveBeatIndex(0); if (!isSequencerPlayingRef.current) { setCurrentPlayingBar(newBarNum); setCurrentSequencerPlayBeat(0); } toast.success(`Bar ${newBarNum} added.`); }, [totalBars, logToConsole]);
  const coreHandleClearBarData = useCallback((barToClearParam) => { logToConsole("[coreHandleClearBarData]", barToClearParam); const barToClear = barToClearParam === undefined ? currentEditingBar : barToClearParam; if (!songDataRef.current[barToClear]) { toast.warn(`Bar ${barToClear} not found.`); return; } setSongData(p => ({ ...p, [barToClear]: createNewBarData() })); if (barToClear === currentEditingBar && !isSequencerPlayingRef.current) { setActiveBeatIndex(0); if (currentPlayingBarRef.current === barToClear) setCurrentSequencerPlayBeat(0); } toast.info(`Bar ${barToClear} cleared.`); }, [currentEditingBar, logToConsole]);
  const coreHandleRemoveBar = useCallback((barToRemoveParam) => { logToConsole("[coreHandleRemoveBar]", barToRemoveParam); const barToRemove = barToRemoveParam === undefined ? currentEditingBar : barToRemoveParam; if (totalBars <= 1) { coreHandleClearBarData(1); toast.info("Only bar; cleared instead."); return; } if (!songDataRef.current[barToRemove]) { toast.error(`Bar ${barToRemove} not found.`); return; } setSongData(p => { const temp = { ...p }; delete temp[barToRemove]; const newS = {}; let newIdx = 1; Object.keys(temp).map(Number).sort((a,b)=>a-b).forEach(oldN => { newS[newIdx++] = temp[oldN]; }); return Object.keys(newS).length > 0 ? newS : {1: createNewBarData()}; }); const newTotal = Math.max(1, totalBars - 1); let newEdBar = currentEditingBar; if (currentEditingBar > barToRemove) newEdBar--; else if (currentEditingBar === barToRemove) newEdBar = Math.min(barToRemove, newTotal); setCurrentEditingBar(Math.max(1, newEdBar)); setActiveBeatIndex(0); if (!isSequencerPlayingRef.current) { let newPlayBar = currentPlayingBarRef.current; if (currentPlayingBarRef.current > barToRemove) newPlayBar--; else if (currentPlayingBarRef.current === barToRemove) newPlayBar = Math.min(barToRemove, newTotal); setCurrentPlayingBar(Math.max(1, newPlayBar)); setCurrentSequencerPlayBeat(0); } toast.success(`Bar ${barToRemove} removed.`); }, [currentEditingBar, totalBars, coreHandleClearBarData, logToConsole]);
  const coreHandleToggleLoop = useCallback(() => { 
    logToConsole("[coreHandleToggleLoop]");
    const newLState = !isLoopingRef.current;
    setIsLooping(newLState);
    if (!newLState) {
      setLoopStartPoint(null);
      setLoopEndPoint(null);
      toast.info("Loop OFF.");
    } else {
      if (!loopStartPointRef.current && !loopEndPointRef.current) {
        const barForLoop = currentEditingBarRefForKeyboard.current || 1; 
        const beatsInBar = songDataRef.current[barForLoop]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST;
        const startPoint = { bar: barForLoop, beat: 0 };
        const endPoint = { bar: barForLoop, beat: beatsInBar > 0 ? beatsInBar - 1 : 0 };
        setLoopStartPoint(startPoint);
        setLoopEndPoint(endPoint);
        logToConsole(`[coreHandleToggleLoop] Default loop set for Bar ${barForLoop} (Beats 0 to ${endPoint.beat})`);
        toast.success(`Loop ON for Bar ${barForLoop}.`);
      } else {
        toast.success("Loop ON.");
        logToConsole(`[coreHandleToggleLoop] Loop ON with existing points: Start=${JSON.stringify(loopStartPointRef.current)}, End=${JSON.stringify(loopEndPointRef.current)}`);
      }
    }
  }, [logToConsole]);
  const coreHandleSetLoopStart = useCallback(() => { logToConsole("[coreHandleSetLoopStart]"); const bar = isSequencerPlayingRef.current ? currentPlayingBarRef.current : (currentEditingBar || 1); const beat = isSequencerPlayingRef.current ? currentSequencerPlayBeatRef.current : (activeBeatIndex ?? 0); const newStart = {bar, beat}; setLoopStartPoint(newStart); if (!isLoopingRef.current) setIsLooping(true); const end = loopEndPointRef.current; if (!end || newStart.bar > end.bar || (newStart.bar === end.bar && newStart.beat > end.beat)) { const beatsInBar = songDataRef.current[newStart.bar]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST; setLoopEndPoint({bar: newStart.bar, beat: Math.max(newStart.beat, beatsInBar > 0 ? beatsInBar -1 : 0)}); toast.info(`Loop start. End adjusted.`); } else toast.info(`Loop start set.`); }, [currentEditingBar, activeBeatIndex, logToConsole]);
  const coreHandleSetLoopEnd = useCallback(() => { logToConsole("[coreHandleSetLoopEnd]"); const bar = isSequencerPlayingRef.current ? currentPlayingBarRef.current : (currentEditingBar || 1); const beat = isSequencerPlayingRef.current ? currentSequencerPlayBeatRef.current : (activeBeatIndex ?? 0); const newEnd = {bar, beat}; setLoopEndPoint(newEnd); if (!isLoopingRef.current) setIsLooping(true); const start = loopStartPointRef.current; if (!start || newEnd.bar < start.bar || (newEnd.bar === start.bar && newEnd.beat < start.beat)) { setLoopStartPoint({bar: newEnd.bar, beat: 0}); toast.info(`Loop end. Start adjusted.`); } else toast.info(`Loop end set.`); }, [currentEditingBar, activeBeatIndex, logToConsole]);
  const coreHandleSetDetectedBPMAsMaster = useCallback(() => { logToConsole("[coreHandleSetDetectedBPMAsMaster]"); if (mediaOriginalBPM && !isNaN(parseFloat(mediaOriginalBPM))) { coreHandleBpmChange(mediaOriginalBPM); toast.success(`Master BPM set to media's ~${parseFloat(mediaOriginalBPM).toFixed(0)} BPM.`); } else toast.warn("No valid detected media BPM."); }, [mediaOriginalBPM, coreHandleBpmChange, logToConsole]);
  const coreHandleSaveSequence = useCallback(async () => { logToConsole("[coreHandleSaveSequence]"); const filename = currentFilenameRef.current || "untitled_sequence"; const pkgState = { songData: songDataRef.current, bpm: bpmRef.current, timeSignature: timeSignatureRef.current, currentFilename: filename, mediaFile: mediaFileRef.current, mediaOriginalBPM, loopStartPoint: loopStartPointRef.current, loopEndPoint: loopEndPointRef.current, currentKeyframes }; try { const seqJson = packageToSEQFormatLocal(pkgState, filename); if (!seqJson) { toast.error("Package fail."); return; } downloadFile(JSON.stringify(seqJson, null, 2), filename.endsWith('.seqr') ? filename : `${filename}.seqr`, "application/json;charset=utf-8"); toast.success(`"${filename}" saved locally!`); } catch (e) { toast.error(`Save error: ${e.message}`); console.error("Save error:", e); } }, [packageToSEQFormatLocal, mediaOriginalBPM, currentKeyframes, logToConsole]);
  const coreHandleLoadSequence = useCallback(async (file) => { logToConsole("[coreHandleLoadSequence]", file ? file.name : "No file"); if (!file) { toast.error("No file."); return; } if (!file.name.toLowerCase().endsWith('.seqr') && file.type !== 'application/json') { toast.error("Invalid file. Select .SĒQ."); return; } try { const content = await readFileAsText(file); const data = JSON.parse(content); if (!data || !data.poSEQr_notation_data) { toast.error("Invalid .SĒQ format."); return; } if (isSequencerPlayingRef.current) await coreHandleStop(); const tsParts = (data.time_signature || `${DEFAULT_TIME_SIGNATURE.beatsPerBar}/${DEFAULT_TIME_SIGNATURE.beatUnit}`).split('/'); const newTS = { beatsPerBar: Math.max(1,Math.min(parseInt(tsParts[0],10)||DEFAULT_NUM_BEATS_PER_BAR_CONST,MAX_BEATS_PER_BAR_HARD_LIMIT)), beatUnit: [2,4,8,16,32].includes(parseInt(tsParts[1],10))?parseInt(tsParts[1],10):DEFAULT_TIME_SIGNATURE.beatUnit }; setContextTimeSignature(newTS); setContextBpm(Math.max(BPM_MIN,Math.min(BPM_MAX,data.tempo||DEFAULT_BPM))); await new Promise(r=>setTimeout(r,0)); const stepsPerBar = DEFAULT_NUM_BEATS_PER_BAR_CONST; const newSong = {}; let maxBar = 0; Object.entries(data.poSEQr_notation_data).forEach(([key,beatsArr])=>{ if(key.startsWith("bar_")){ const num = parseInt(key.split("_")[1],10); if(!isNaN(num)&&num>0){ maxBar=Math.max(maxBar,num); if(Array.isArray(beatsArr)){ newSong[num]=beatsArr.map((b,i)=>({...createDefaultBeatObject(i),...b,id:i})).slice(0,stepsPerBar); while(newSong[num].length<stepsPerBar)newSong[num].push(createDefaultBeatObject(newSong[num].length)); } else newSong[num]=createNewBarData(); }}}); const totalLoadedBars = Math.max(maxBar,data.total_bars||0,Object.keys(newSong).length,1); for(let i=1;i<=totalLoadedBars;i++)if(!newSong[i])newSong[i]=createNewBarData(); setSongData(Object.keys(newSong).length?newSong:{1:createNewBarData()}); setCurrentFilename(String(data.title||file.name||"untitled").replace(/\.(seqr|json)$/i,'').trim()); const cM=data.custom_metadata||{}; const aR=data.audio_reference||{}; setMediaOriginalBPM(String(cM.client_media_original_bpm||aR.original_bpm_estimate||'')); setLoopStartPoint(cM.client_loop_start_bar_beat||null); setLoopEndPoint(cM.client_loop_end_bar_beat||null); setIsLooping(!!(cM.client_loop_start_bar_beat&&cM.client_loop_end_bar_beat)); setCurrentKeyframes(Array.isArray(cM.client_keyframes_media_times_sec)?cM.client_keyframes_media_times_sec.sort((a,b)=>a-b):[]); const firstBar=Math.min(...Object.keys(newSong).map(Number).filter(n=>n>0))||1; setCurrentEditingBar(firstBar); setActiveBeatIndex(null); setActiveEditingJoint(null); setCurrentPlayingBar(firstBar); setCurrentSequencerPlayBeat(0); setMainTimecodeParts({mm:'00',ss:'00',cs:'00'}); setSequencerWasActive(false); if(mediaSrcForCleanupRef.current?.startsWith('blob:'))URL.revokeObjectURL(mediaSrcForCleanupRef.current); mediaSrcForCleanupRef.current=null; setMediaFile(null);setMediaSrc(null);setMediaType(null);setMediaDuration(0);setMediaCurrentTime(0); toast.success(`Seq "${currentFilenameRef.current}" loaded!`); } catch(e) { toast.error(`Load error: ${e.message}`); console.error("Load error:", e); } }, [coreHandleStop, setContextBpm, setContextTimeSignature, readFileAsText, logToConsole]);
  const coreHandleNewSequence = useCallback(async () => { logToConsole("[coreHandleNewSequence]"); if (window.confirm("New sequence? Unsaved changes lost.")) { if (isSequencerPlayingRef.current) await coreHandleStop(); setSongData({1: createNewBarData()}); setCurrentEditingBar(1); setActiveBeatIndex(null); setActiveEditingJoint(null); setLoopStartPoint(null); setLoopEndPoint(null); setIsLooping(false); setCopiedBarData(null); setCurrentFilename('untitled_sequence'); if (mediaSrcForCleanupRef.current?.startsWith('blob:')) URL.revokeObjectURL(mediaSrcForCleanupRef.current); mediaSrcForCleanupRef.current=null; setMediaFile(null);setMediaSrc(null);setMediaType(null);setMediaDuration(0);setMediaCurrentTime(0); setMediaOriginalBPM(''); setCurrentKeyframes([]); setMainTimecodeParts({mm:'00',ss:'00',cs:'00'}); setSequencerWasActive(false); setCurrentPlayingBar(1); setCurrentSequencerPlayBeat(0); toast.info("New sequence created."); } }, [coreHandleStop, logToConsole]);
  const coreHandleCopyBar = useCallback((barToCopyParam) => { logToConsole("[coreHandleCopyBar]", barToCopyParam); const barIdx = barToCopyParam === undefined ? currentEditingBar : barToCopyParam; const barData = songDataRef.current[barIdx]; if (barData) { setCopiedBarData(JSON.parse(JSON.stringify(barData))); toast.success(`Bar ${barIdx} copied.`); } else toast.error(`Bar ${barIdx} not found.`); }, [currentEditingBar, logToConsole]);
  const coreHandlePasteBar = useCallback((barToPasteToParam) => { logToConsole("[coreHandlePasteBar]", barToPasteToParam); const barIdx = barToPasteToParam === undefined ? currentEditingBar : barToPasteToParam; const dataToPaste = copiedBarDataRef.current; if (dataToPaste) { setSongData(p => { const newS = JSON.parse(JSON.stringify(p)); const stepsPerBar = DEFAULT_NUM_BEATS_PER_BAR_CONST; newS[barIdx] = Array(stepsPerBar).fill(null).map((_,i)=>{ const copied = dataToPaste[i]; return copied ? {...createDefaultBeatObject(i),...copied,id:i} : createDefaultBeatObject(i);}); return newS; }); toast.success(`Data pasted to Bar ${barIdx}.`); } else toast.error("Nothing to paste."); }, [currentEditingBar, logToConsole]);
  const coreHandleMarkKeyframe = useCallback(() => { logToConsole("[coreHandleMarkKeyframe]"); if (appModeRef.current !== MODE_SYNC || !mediaSrcForCleanupRef.current) { toast.warn("Keyframes only SYNC w/ media."); return; } const time = parseFloat(mediaCurrentTime.toFixed(3)); if (isNaN(time) || time < 0) { toast.warn("Invalid media time."); return; } setCurrentKeyframes(p => [...new Set([...p,time])].sort((a,b)=>a-b)); let bar = currentPlayingBarRef.current; let beat = currentSequencerPlayBeatRef.current; if (!isSequencerPlayingRef.current && activeBeatIndex !== null && currentEditingBar) { bar = currentEditingBar; beat = activeBeatIndex; } setSongData(p => { const newS=JSON.parse(JSON.stringify(p)); const bA=newS[bar]||createNewBarData(); const bO=bA[beat]||createDefaultBeatObject(beat); bO.mediaCuePoint=time; bA[beat]=bO; newS[bar]=bA; return newS; }); toast.success(`Keyframe ${time.toFixed(2)}s linked (Bar ${bar}, Beat ${beat+1}).`); }, [mediaCurrentTime, currentEditingBar, activeBeatIndex, logToConsole]);
  const coreHandleDeleteKeyframe = useCallback((timeToDelete) => { logToConsole("[coreHandleDeleteKeyframe]", timeToDelete); setCurrentKeyframes(p => p.filter(kf => Math.abs(kf - timeToDelete) > 0.0001)); setSongData(p => { const newS = JSON.parse(JSON.stringify(p)); let cleared = false; Object.keys(newS).forEach(barN => { (newS[barN]||[]).forEach(beat => { if (beat && beat.mediaCuePoint !== null && Math.abs(beat.mediaCuePoint - timeToDelete) < 0.0001) { beat.mediaCuePoint = null; cleared = true; } }); }); if(cleared)logToConsole(`Cleared cue for ${timeToDelete.toFixed(3)}s.`); return newS; }); toast.info(`Keyframe ${timeToDelete.toFixed(2)}s removed.`); }, [logToConsole]);
  const coreHandleNudgeJointPosition = useCallback((axis, direction, amount) => { if (!activeEditingJointRef.current || activeBeatIndex === null || !currentEditingBarRefForKeyboard.current) { logToConsole("Nudge Joint: No active joint/beat/bar selected."); return; } const currentBarForNudge = currentEditingBarRefForKeyboard.current; logToConsole(`[coreHandleNudgeJointPosition] Joint: ${activeEditingJointRef.current}, Axis: ${axis}, Dir: ${direction}, Amt: ${amount}, Bar: ${currentBarForNudge}, Beat: ${activeBeatIndex}`); setSongData(prevSongData => { const newSongData = JSON.parse(JSON.stringify(prevSongData)); const barData = newSongData[currentBarForNudge] || createNewBarData(); const beatData = barData[activeBeatIndex] || createDefaultBeatObject(activeBeatIndex); let jointInfo = beatData.jointInfo || {}; let specificJointData = jointInfo[activeEditingJointRef.current] || { vector: { x: 0, y: 0, z: 0, x_base_direction: 0, y_base_direction: 0 } }; let currentVector = { ...(specificJointData.vector || { x: 0, y: 0, z: 0, x_base_direction: 0, y_base_direction: 0 }) }; if (axis === 'x') currentVector.x += direction * amount; else if (axis === 'y') currentVector.y += direction * amount; else if (axis === 'z') currentVector.z += direction * amount; currentVector.x = parseFloat(Math.max(-1, Math.min(1, currentVector.x)).toFixed(3)); currentVector.y = parseFloat(Math.max(-1, Math.min(1, currentVector.y)).toFixed(3)); currentVector.z = parseFloat(Math.max(-1, Math.min(1, currentVector.z)).toFixed(3)); const snapThreshold = 0.15; if (Math.abs(currentVector.x) > snapThreshold || Math.abs(currentVector.y) > snapThreshold) { if (Math.abs(currentVector.x) > Math.abs(currentVector.y)) { currentVector.x_base_direction = currentVector.x > 0 ? 1 : -1; currentVector.y_base_direction = 0; } else if (Math.abs(currentVector.y) > Math.abs(currentVector.x)) { currentVector.x_base_direction = 0; currentVector.y_base_direction = currentVector.y > 0 ? 1 : -1; } else { currentVector.x_base_direction = currentVector.x > 0 ? 1 : -1; currentVector.y_base_direction = currentVector.y > 0 ? 1 : -1; } } else { currentVector.x_base_direction = 0; currentVector.y_base_direction = 0; } specificJointData.vector = currentVector; jointInfo[activeEditingJointRef.current] = specificJointData; beatData.jointInfo = jointInfo; barData[activeBeatIndex] = beatData; newSongData[currentBarForNudge] = barData; return newSongData; }); }, [activeBeatIndex, logToConsole]);


  // SECTION 7: WRAPPED HANDLERS
  const handleModeChange = useMemo(() => makeAsyncHandler('ModeChange', coreHandleModeChange), [makeAsyncHandler, coreHandleModeChange]);
  const handleSoundBankSelect = useMemo(() => makeAsyncHandler('SoundBankSelect', coreHandleSoundBankSelect, true), [makeAsyncHandler, coreHandleSoundBankSelect]);
  const handleJointSelect = useMemo(() => makeAsyncHandler('JointSelect', coreHandleJointSelect), [makeAsyncHandler, coreHandleJointSelect]);
  const handlePbTimeSignatureChange = useMemo(() => makeAsyncHandler('TimeSignatureChangeFromUI', coreHandleTimeSignatureChange), [makeAsyncHandler, coreHandleTimeSignatureChange]);
  const handlePbBpmChange = useMemo(() => makeAsyncHandler('BpmChangeFromUI', coreHandleBpmChange), [makeAsyncHandler, coreHandleBpmChange]);
  const handlePbMediaOriginalBPMChange = useMemo(() => makeAsyncHandler('MediaOriginalBPMChangeFromUI', coreHandleMediaOriginalBPMChange), [makeAsyncHandler, coreHandleMediaOriginalBPMChange]);
  const handlePbSkipIntervalChange = useMemo(() => makeAsyncHandler('SkipIntervalChangeFromUI', coreHandleSkipIntervalChange), [makeAsyncHandler, coreHandleSkipIntervalChange]);
  const wrappedPlaybackHandlers = useMemo(() => ({
    onPlayPause: makeAsyncHandler('PlayPause', coreHandlePlayPause, true),
    onStop: makeAsyncHandler('Stop', coreHandleStop, true),
    onTapTempo: makeAsyncHandler('TapTempo', coreHandleTapTempo),
    onNextBar: makeAsyncHandler('NextBarFocus', coreHandleNextBar),
    onPrevBar: makeAsyncHandler('PrevBarFocus', coreHandlePrevBar),
    onAddBar: makeAsyncHandler('AddBar', coreHandleAddBar),
    onRemoveBar: makeAsyncHandler('RemoveBar', () => coreHandleRemoveBar(currentEditingBarRefForKeyboard.current)),
    onClearBar: makeAsyncHandler('ClearBar', () => coreHandleClearBarData(currentEditingBarRefForKeyboard.current)),
    onToggleLoop: makeAsyncHandler('ToggleLoop', coreHandleToggleLoop),
    onSetLoopStart: makeAsyncHandler('SetLoopStart', coreHandleSetLoopStart),
    onSetLoopEnd: makeAsyncHandler('SetLoopEnd', coreHandleSetLoopEnd),
    onCopyBar: makeAsyncHandler('CopyBar', () => coreHandleCopyBar(currentEditingBarRefForKeyboard.current)),
    onPasteBar: makeAsyncHandler('PasteBar', () => coreHandlePasteBar(currentEditingBarRefForKeyboard.current)),
    canPaste: !!copiedBarData,
    onSkipForward: makeAsyncHandler('SkipForward', () => coreHandleIntervalSkip(1), true),
    onSkipBackward: makeAsyncHandler('SkipBackward', () => coreHandleIntervalSkip(-1), true),
    onDetectMediaBPM: makeAsyncHandler('DetectMediaBPMFromUI', () => coreHandleDetectMediaBPM(mediaFileRef.current)),
    onSetDetectedBPMAsMaster: makeAsyncHandler('SetMasterBPMFromMediaUI', coreHandleSetDetectedBPMAsMaster),
  }), [ makeAsyncHandler, copiedBarData, coreHandlePlayPause, coreHandleStop, coreHandleTapTempo, coreHandleNextBar, coreHandlePrevBar, coreHandleAddBar, coreHandleRemoveBar, coreHandleClearBarData, coreHandleToggleLoop, coreHandleSetLoopStart, coreHandleSetLoopEnd, coreHandleCopyBar, coreHandlePasteBar, coreHandleIntervalSkip, coreHandleDetectMediaBPM, coreHandleSetDetectedBPMAsMaster ]);
  const handleFileSelectedForMedia = useMemo(() => makeAsyncHandler('MediaFileSelected', (file) => coreHandleFileSelected(file, mediaFileInputRef.current)), [makeAsyncHandler, coreHandleFileSelected]);
  const handleSaveSequenceLocal = useMemo(() => makeAsyncHandler('SaveSequenceLocal', coreHandleSaveSequence), [makeAsyncHandler, coreHandleSaveSequence]);
  const handleLoadSequenceLocal = useMemo(() => makeAsyncHandler('LoadSequenceLocal', coreHandleLoadSequence, true), [makeAsyncHandler, coreHandleLoadSequence]);
  const handleNewSequenceLocal = useMemo(() => makeAsyncHandler('NewSequenceLocal', coreHandleNewSequence), [makeAsyncHandler, coreHandleNewSequence]);
  const handleBeatClicked = useMemo(() => makeAsyncHandler('BeatClicked', coreHandleBeatClick, true), [makeAsyncHandler, coreHandleBeatClick]);
  const handleAddSoundToBeatClicked = useMemo(() => makeAsyncHandler('AddSoundToBeat', coreHandleAddSoundToBeat, true), [makeAsyncHandler, coreHandleAddSoundToBeat]);
  const handleDeleteSoundFromBeatClicked = useMemo(() => makeAsyncHandler('DeleteSoundFromBeat', coreHandleDeleteSoundFromBeat), [makeAsyncHandler, coreHandleDeleteSoundFromBeat]);
  const handleMarkKeyframeAction = useMemo(() => makeAsyncHandler('MarkKeyframeAction', coreHandleMarkKeyframe), [makeAsyncHandler, coreHandleMarkKeyframe]);
  const handleDeleteKeyframeAction = useMemo(() => makeAsyncHandler('DeleteKeyframeAction', coreHandleDeleteKeyframe), [makeAsyncHandler, coreHandleDeleteKeyframe]);
  const handleSeekAction = useMemo(() => makeAsyncHandler('SeekMediaOrSequence', coreHandleSeek, true), [makeAsyncHandler, coreHandleSeek]); 
  const handleModalBeatSelect = useCallback((newBeatIndex) => { logToConsole(`Modal selected beat index: ${newBeatIndex} for bar ${currentEditingBarRefForKeyboard.current}`); setActiveBeatIndex(newBeatIndex); }, [setActiveBeatIndex, logToConsole]);
  const modalSaveHandlers = useMemo(() => ({ onSaveGrounding: makeAsyncHandler('ModalSaveGrounding', (gData) => { const{bar,beat}={bar:currentEditingBarRefForKeyboard.current,beat:activeBeatIndex}; if(beat===null||!bar)return; setSongData(p=>{const nS=JSON.parse(JSON.stringify(p)); const tBA=nS[bar]||createNewBarData(); if(!tBA[beat])tBA[beat]=createDefaultBeatObject(beat); tBA[beat].grounding={L:gData.L||null,R:gData.R||null,L_weight:gData.L_weight!==undefined?parseInt(gData.L_weight,10):50}; nS[bar]=tBA; return nS;}); toast.success("Grounding saved."); }), onSaveJointDetails: makeAsyncHandler('ModalSaveJoint', (jAbbrev,details) => { const{bar,beat}={bar:currentEditingBarRefForKeyboard.current,beat:activeBeatIndex}; if(beat===null||!bar||!jAbbrev)return; setSongData(p=>{const nS=JSON.parse(JSON.stringify(p)); const tBA=nS[bar]||createNewBarData(); if(!tBA[beat])tBA[beat]=createDefaultBeatObject(beat); const cJI=tBA[beat].jointInfo||{}; tBA[beat].jointInfo={...cJI,[jAbbrev]:details}; nS[bar]=tBA; return nS;}); toast.success(`Joint ${ALL_JOINTS_MAP[jAbbrev]?.name||jAbbrev} saved.`); }), onClearJointDetails: makeAsyncHandler('ModalClearJoint', (jAbbrevToClear) => { const bUp=currentEditingBarRefForKeyboard.current; const btUp=activeBeatIndex; if(btUp===null||!bUp||!jAbbrevToClear)return; setSongData(pS=>{const nS=JSON.parse(JSON.stringify(pS)); if(nS[bUp]?.[btUp]?.jointInfo){delete nS[bUp][btUp].jointInfo[jAbbrevToClear]; if(Object.keys(nS[bUp][btUp].jointInfo).length===0) delete nS[bUp][btUp].jointInfo;} return nS;}); toast.info(`Data for ${ALL_JOINTS_MAP[jAbbrevToClear]?.name||jAbbrevToClear} cleared.`); }), onClearGrounding: makeAsyncHandler('ModalClearGrounding', () => { const bUp=currentEditingBarRefForKeyboard.current; const btUp=activeBeatIndex; if(btUp===null||!bUp)return; setSongData(pS=>{const nS=JSON.parse(JSON.stringify(pS)); const tBA=nS[bUp]||createNewBarData(); if(!tBA[btUp])tBA[btUp]=createDefaultBeatObject(btUp); tBA[btUp].grounding={L:null,R:null,L_weight:50}; nS[bUp]=tBA; return nS;}); toast.info("Grounding data cleared."); }), onSaveSyllable: makeAsyncHandler('ModalSaveSyllable', (syllableStr) => { const bUp=currentEditingBarRefForKeyboard.current; const btUp=activeBeatIndex; if(btUp===null||!bUp)return; setSongData(pS=>{const nS=JSON.parse(JSON.stringify(pS)); const tBA=nS[bUp]||createNewBarData(); if(!tBA[btUp])tBA[btUp]=createDefaultBeatObject(btUp); tBA[btUp].syllable=syllableStr||''; nS[bUp]=tBA; return nS;}); toast.success("Syllable saved."); }), onSaveHeadOver: makeAsyncHandler('ModalSaveHeadOver', (headOverStr) => { const bUp=currentEditingBarRefForKeyboard.current; const btUp=activeBeatIndex; if(btUp===null||!bUp)return; setSongData(pS=>{const nS=JSON.parse(JSON.stringify(pS)); const tBA=nS[bUp]||createNewBarData(); if(!tBA[btUp])tBA[btUp]=createDefaultBeatObject(btUp); tBA[btUp].headOver=headOverStr==='None'?null:headOverStr; nS[bUp]=tBA; return nS;}); toast.success("Head Over Target saved."); }) }), [makeAsyncHandler, activeBeatIndex, logToConsole]);


  // SECTION 8: useEffect HOOKS 
  // ... (All useEffects from your "once working" file, with the keyboard shortcut one updated)
  useEffect(() => { songDataRef.current = songData; }, [songData]);
  useEffect(() => { currentSequencerPlayBeatRef.current = currentSequencerPlayBeat; }, [currentSequencerPlayBeat]);
  useEffect(() => { currentPlayingBarRef.current = currentPlayingBar; }, [currentPlayingBar]);
  useEffect(() => { isSequencerPlayingRef.current = isSequencerPlaying; }, [isSequencerPlaying]);
  useEffect(() => { isMediaActuallyPlayingRef.current = isMediaActuallyPlaying; }, [isMediaActuallyPlaying]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { loopStartPointRef.current = loopStartPoint; }, [loopStartPoint]);
  useEffect(() => { loopEndPointRef.current = loopEndPoint; }, [loopEndPoint]);
  useEffect(() => { appModeRef.current = appMode; }, [appMode]);
  useEffect(() => { bpmRef.current = contextBpm ?? DEFAULT_BPM; }, [contextBpm]);
  useEffect(() => { timeSignatureRef.current = contextTimeSignature ?? DEFAULT_TIME_SIGNATURE; }, [contextTimeSignature]);
  useEffect(() => { currentFilenameRef.current = currentFilename; }, [currentFilename]);
  useEffect(() => { mediaFileRef.current = mediaFile; }, [mediaFile]);
  useEffect(() => { copiedBarDataRef.current = copiedBarData; }, [copiedBarData]);
  useEffect(() => { activeEditingJointRef.current = activeEditingJoint; }, [activeEditingJoint]);
  useEffect(() => { currentSoundInBankRef.current = currentSoundInBank; }, [currentSoundInBank]);
  useEffect(() => { currentEditingBarRefForKeyboard.current = currentEditingBar; }, [currentEditingBar]);

  useEffect(() => { if (mediaSrc && mediaSrc !== mediaSrcForCleanupRef.current) { if (mediaSrcForCleanupRef.current?.startsWith('blob:')) URL.revokeObjectURL(mediaSrcForCleanupRef.current); mediaSrcForCleanupRef.current = mediaSrc; } }, [mediaSrc]);
  useEffect(() => { return () => { if (mediaSrcForCleanupRef.current?.startsWith('blob:')) URL.revokeObjectURL(mediaSrcForCleanupRef.current); }; }, []);

  useEffect(() => { let isMounted = true; const initAudio = async () => { if (await ensureAudioContextResumedAndInitialized()) { if (isMounted && !soundsPreloaded) { try { await managerPreloadSounds(Object.values(tr808SoundFiles)); if (isMounted) setSoundsPreloaded(true); } catch (e) { if (isMounted) toast.error("Sound preload failed."); console.error("Sound preload error:", e); } } } }; initAudio(); return () => { isMounted = false; }; }, [ensureAudioContextResumedAndInitialized, soundsPreloaded]);

  useEffect(() => {
    const stepsPerBar = DEFAULT_NUM_BEATS_PER_BAR_CONST; let needsUpdate = false;
    const currentSongSnapshot = songDataRef.current || {}; const updatedSongData = { ...currentSongSnapshot };
    if (Object.keys(updatedSongData).length === 0) { updatedSongData[1] = createNewBarData(); needsUpdate = true; }
    Object.keys(updatedSongData).forEach(barNumStr => { const barNum = parseInt(barNumStr, 10); if (updatedSongData[barNum] && updatedSongData[barNum].length !== stepsPerBar) { const oldBar = updatedSongData[barNum]; const newBar = Array(stepsPerBar).fill(null).map((_, i) => oldBar[i] || createDefaultBeatObject(i)); updatedSongData[barNum] = newBar; needsUpdate = true; } });
    if (needsUpdate) {
      logToConsole('Correcting songData structure'); setSongData(updatedSongData);
      const playheadBarData = updatedSongData[currentPlayingBarRef.current] || []; const stepsInPlayheadBar = playheadBarData.length || stepsPerBar;
      if (currentSequencerPlayBeatRef.current >= stepsInPlayheadBar) setCurrentSequencerPlayBeat(Math.max(0, stepsInPlayheadBar - 1));
      const editingBarData = updatedSongData[currentEditingBarRefForKeyboard.current] || []; const stepsInEditingBar = editingBarData.length || stepsPerBar;
      if (activeBeatIndex !== null && activeBeatIndex >= stepsInEditingBar) setActiveBeatIndex(Math.max(0, stepsInEditingBar - 1));
    }
  }, [songData, currentEditingBar, activeBeatIndex, currentPlayingBar, logToConsole]);

  useEffect(() => { // Sequencer Timer
      if (!isSequencerPlaying || appMode === MODE_SYNC) { // In SYNC mode, media drives the sequencer ticks, not this timer.
          if (sequencerTimerRef.current) clearInterval(sequencerTimerRef.current);
          sequencerTimerRef.current = null;
          return;
      }

      if (!audioInitialized || !soundsPreloaded) {
          if (isSequencerPlaying) {
              logToConsole("[SEQ_TIMER] Audio/Sounds not ready, stopping playback.");
              setIsSequencerPlaying(false); // Stop if prerequisites are not met
          }
          return;
      }

      const currentBpmVal = bpmRef.current;
      const currentTimeSigVal = timeSignatureRef.current;
      const currentSongVal = songDataRef.current;

      const beatsInCurrentBarForIntervalCalc = currentSongVal[currentPlayingBarRef.current]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST;
      
      // Calculate stepsPerMusicalBeat based on the *actual number of steps in the current bar* and the *time signature's beatsPerBar*
      // This determines how many sequencer steps constitute one musical beat for timing the interval.
      const stepsPerMusicalBeat = currentTimeSigVal.beatsPerBar > 0 ? 
                                  beatsInCurrentBarForIntervalCalc / currentTimeSigVal.beatsPerBar : 
                                  beatsInCurrentBarForIntervalCalc; // Fallback if beatsPerBar is 0

      let intervalMs = (currentBpmVal > 0 && stepsPerMusicalBeat > 0 && isFinite(stepsPerMusicalBeat)) 
                    ? (60000 / currentBpmVal) / stepsPerMusicalBeat 
                    : (60000 / DEFAULT_BPM) / (DEFAULT_NUM_BEATS_PER_BAR_CONST / DEFAULT_TIME_SIGNATURE.beatsPerBar); // Robust fallback

      if (!isFinite(intervalMs) || intervalMs <= 5) {
          logToConsole(`[SEQ_TIMER] Warning: Calculated intervalMs is ${intervalMs}. Setting to fallback 50ms.`);
          intervalMs = 50; // Safety net for too small or invalid interval
      }
      
      logToConsole(`[SEQ_TIMER] Starting. BPM: ${currentBpmVal}, TimeSig: ${currentTimeSigVal.beatsPerBar}/${currentTimeSigVal.beatUnit}, StepsPerMusicalBeat: ${stepsPerMusicalBeat.toFixed(2)}, Interval: ${intervalMs.toFixed(2)}ms`);

      sequencerTimerRef.current = setInterval(() => {
        if (!isSequencerPlayingRef.current) { // Double check, as state might change between interval and execution
          clearInterval(sequencerTimerRef.current);
          sequencerTimerRef.current = null;
          return;
        }

        const currentBarSnapshot = currentPlayingBarRef.current; // Bar being processed this tick
        const currentBeatSnapshot = currentSequencerPlayBeatRef.current; // Beat (0-indexed step) being processed
        const songSnapshot = songDataRef.current;

        const barDataForTick = songSnapshot[currentBarSnapshot];
        if (!barDataForTick) {
          logToConsole(`[SEQ_TIMER_ERR] No data for bar ${currentBarSnapshot}. Stopping.`);
          coreHandleStop(); // Use coreHandleStop for proper cleanup
          return;
        }
        const stepsInThisBar = barDataForTick.length || DEFAULT_NUM_BEATS_PER_BAR_CONST;
        const beatObjectForTick = barDataForTick[currentBeatSnapshot];

        // Play sounds
        if (appModeRef.current === MODE_SEQ && beatObjectForTick?.sounds?.length > 0) {
          beatObjectForTick.sounds.forEach(key => {
            if (tr808SoundFiles[key]) managerPlaySound(tr808SoundFiles[key]);
          });
        }

        // Advance playhead
        let nextBeatToSet = currentBeatSnapshot + 1;
        let nextBarToSet = currentBarSnapshot;
        let shouldStopAfterThisTick = false;

        if (isLoopingRef.current) {
          if (loopStartPointRef.current && loopEndPointRef.current) { // Specific loop range
            const currentGlobalTick = calculateGlobalTick({ bar: currentBarSnapshot, beat: currentBeatSnapshot });
            if (currentGlobalTick === globalLoopEndTick) {
              const { bar: lsb, beat: lsbt } = convertGlobalTickToBarBeat(globalLoopStartTick, songSnapshot);
              nextBarToSet = lsb; nextBeatToSet = lsbt;
            } else if (nextBeatToSet >= stepsInThisBar) { // End of bar within loop range
              nextBeatToSet = 0; nextBarToSet++;
              const nextGlobalAbsTick = calculateGlobalTick({ bar: nextBarToSet, beat: nextBeatToSet });
              if (nextGlobalAbsTick > globalLoopEndTick || nextGlobalAbsTick < globalLoopStartTick) { // Gone past loop
                  const { bar: lsb, beat: lsbt } = convertGlobalTickToBarBeat(globalLoopStartTick, songSnapshot);
                  nextBarToSet = lsb; nextBeatToSet = lsbt;
              }
            }
          } else { // General loop (no specific points) - loop current bar (or current set of bars if that's intended)
                  // For "loop the entire current bar / 16 beats" when no points set:
            if (nextBeatToSet >= stepsInThisBar) { // Reached end of the current bar
              nextBeatToSet = 0; // Loop back to the start of the SAME bar
              // nextBarToSet remains currentBarSnapshot
              logToConsole(`[SEQ_TIMER] General Loop: End of Bar ${currentBarSnapshot}, looping to Beat 1.`);
            }
          }
        } else { // Not looping
          if (nextBeatToSet >= stepsInThisBar) {
            nextBeatToSet = 0;
            nextBarToSet++;
            const totalSongBars = Object.keys(songSnapshot).length;
            if (nextBarToSet > totalSongBars) { // Went past the last bar
              shouldStopAfterThisTick = true;
              // For display, keep playhead on the last beat of the last bar
              nextBeatToSet = stepsInThisBar - 1; 
              nextBarToSet = currentBarSnapshot; 
            }
          }
        }
        
        if (shouldStopAfterThisTick) {
          coreHandleStop(); // This will clear the interval via isSequencerPlaying change
        } else {
          // Ensure target bar for next tick exists, otherwise stop.
          if (!songSnapshot[nextBarToSet]) {
              logToConsole(`[SEQ_TIMER_ERR] Next target bar ${nextBarToSet} does not exist. Stopping.`);
              coreHandleStop();
              return;
          }
          setCurrentPlayingBar(nextBarToSet);
          setCurrentSequencerPlayBeat(nextBeatToSet);
        }

        // Timecode update (only if not SYNC mode with active media playback)
        if (!(appModeRef.current === MODE_SYNC && mediaSrc && isMediaActuallyPlayingRef.current)) {
          const newAbsTick = calculateGlobalTick({ bar: nextBarToSet, beat: nextBeatToSet });
          const mainBU = timeSignatureRef.current.beatUnit || 4;
          const tPMB = mainBU > 0 ? INTERNAL_SEQUENCER_RESOLUTION / mainBU : 0;
          if (bpmRef.current > 0 && tPMB > 0) {
              const sPMB_TC = (songSnapshot[nextBarToSet]?.length || DEFAULT_NUM_BEATS_PER_BAR_CONST) / (timeSignatureRef.current.beatsPerBar || 4);
              const intResPerStep = sPMB_TC > 0 ? INTERNAL_SEQUENCER_RESOLUTION / sPMB_TC : 0;
              const totIntRes = newAbsTick * intResPerStep;
              const secPerIntTick = (60 / bpmRef.current) / tPMB;
              const totSec = totIntRes * secPerIntTick;
              if (isFinite(totSec)) {
                  const m=Math.floor(totSec/60),s=Math.floor(totSec%60),cs=Math.floor((totSec*100)%100);
                  setMainTimecodeParts({mm:String(m).padStart(2,'0'),ss:String(s).padStart(2,'0'),cs:String(cs).padStart(2,'0')});
              } else setMainTimecodeParts({mm:'--',ss:'--',cs:'--'});
          } else setMainTimecodeParts({mm:'--',ss:'--',cs:'--'});
        }

      }, intervalMs);

      return () => {
        if (sequencerTimerRef.current) clearInterval(sequencerTimerRef.current);
        sequencerTimerRef.current = null;
      };
    }, [
      isSequencerPlaying, audioInitialized, soundsPreloaded, 
      appMode, contextBpm, contextTimeSignature, songData, 
      isLooping, loopStartPoint, loopEndPoint, globalLoopStartTick, globalLoopEndTick, // Loop related states/memos
      calculateGlobalTick, convertGlobalTickToBarBeat, coreHandleStop, 
      // State setters are not needed as deps for the effect itself, but for the functions they call
      // managerPlaySound, tr808SoundFiles are stable imports
      // mediaSrc, isMediaActuallyPlayingRef are for the timecode update condition
      mediaSrc, 
      setCurrentPlayingBar, setCurrentSequencerPlayBeat, setMainTimecodeParts, setIsSequencerPlaying // Ensure setters are included if used in cleanup or complex logic triggering re-runs
    ]);

  useEffect(() => { /* Media Element Listeners */
    const mediaEl = mediaInteractionRef.current;
    if (!mediaEl || !mediaSrc) { setMediaDuration(0); setMediaCurrentTime(0); setIsMediaActuallyPlaying(false); if (appMode === MODE_SYNC) setMainTimecodeParts({ mm: '00', ss: '00', cs: '00' }); if (sourceNodeRef.current) { try{sourceNodeRef.current.disconnect();}catch(e){} sourceNodeRef.current = null; } if (analyserRef.current) { try{analyserRef.current.disconnect();}catch(e){} analyserRef.current = null; dataArrayRef.current = null; } return; }
    let localSourceNode = null, localAnalyserNode = null;
    if (appMode === MODE_SYNC && audioInitialized && audioContextRef.current?.state === 'running') { if (!sourceNodeRef.current || sourceNodeRef.current.mediaElement !== mediaEl) { if (sourceNodeRef.current) try{sourceNodeRef.current.disconnect();}catch(e){} try { localSourceNode = audioContextRef.current.createMediaElementSource(mediaEl); sourceNodeRef.current = localSourceNode; } catch (e) { if(e.name !== 'InvalidStateError') console.error("MediaElSrcNode err:", e);}} if (sourceNodeRef.current && (!analyserRef.current || !sourceNodeRef.current.context)) { if (analyserRef.current) try{analyserRef.current.disconnect();}catch(e){} try { localAnalyserNode = audioContextRef.current.createAnalyser(); localAnalyserNode.fftSize=1024; localAnalyserNode.smoothingTimeConstant=0.3; sourceNodeRef.current.connect(localAnalyserNode); analyserRef.current = localAnalyserNode; dataArrayRef.current = new Uint8Array(localAnalyserNode.frequencyBinCount);} catch (e) { console.error("AnalyserNode err:",e); analyserRef.current=null; dataArrayRef.current=null;}}} else { if (sourceNodeRef.current) try{sourceNodeRef.current.disconnect(analyserRef.current||undefined);}catch(e){} if (analyserRef.current) try{analyserRef.current.disconnect();}catch(e){} analyserRef.current=null; dataArrayRef.current=null;}
    const hLM=()=>{if(!mediaEl)return; const d=mediaEl.duration; setMediaDuration(isFinite(d)?d:Infinity); if(appMode===MODE_SYNC&&mediaFileRef.current&&!mediaOriginalBPM&&audioInitialized)coreHandleDetectMediaBPM(mediaFileRef.current); if(mediaEl.currentTime===0&&mediaCurrentTime!==0)setMediaCurrentTime(0);}; const hTU=()=>{if(!mediaEl)return; const cT=mediaEl.currentTime; setMediaCurrentTime(cT); if(appMode===MODE_SYNC){const m=Math.floor(cT/60),s=Math.floor(cT%60),cs=Math.floor((cT*100)%100); setMainTimecodeParts({mm:String(m).padStart(2,'0'),ss:String(s).padStart(2,'0'),cs:String(cs).padStart(2,'0')}); if(isSequencerPlayingRef.current){const sng=songDataRef.current,ts=timeSignatureRef.current,effBPM=parseFloat(mediaOriginalBPM)||bpmRef.current,sPBSync=sng[currentPlayingBarRef.current||1]?.length||DEFAULT_NUM_BEATS_PER_BAR_CONST,sPMBSync=ts.beatsPerBar > 0 ? sPBSync/ts.beatsPerBar : sPBSync; if(effBPM>0&&sPMBSync>0){const secPS=(60/effBPM)/sPMBSync; if(secPS>0){const gT=Math.max(0,Math.floor(cT/secPS));const{bar:nB,beat:nBt}=convertGlobalTickToBarBeat(gT,sng, DEFAULT_NUM_BEATS_PER_BAR_CONST); if(nB!==currentPlayingBarRef.current||nBt!==currentSequencerPlayBeatRef.current){if(audioInitialized&&soundsPreloaded){const snds=sng[nB]?.[nBt]?.sounds; if(snds)snds.forEach(k=>{if(tr808SoundFiles[k])managerPlaySound(tr808SoundFiles[k]);});} setCurrentPlayingBar(nB);setCurrentSequencerPlayBeat(nBt);}}}}}}; const hP=()=>{setIsMediaActuallyPlaying(true);if(appMode===MODE_SYNC&&!isSequencerPlayingRef.current)setIsSequencerPlaying(true);}; const hPs=()=>{setIsMediaActuallyPlaying(false);if(appMode===MODE_SYNC&&isSequencerPlayingRef.current)setIsSequencerPlaying(false);}; const hE=async()=>{setIsMediaActuallyPlaying(false);if(appMode===MODE_SYNC){if(isLoopingRef.current){let lSTS=0; if(globalLoopStartTick!==null&&mediaDuration>0){const effBPM=parseFloat(mediaOriginalBPM)||bpmRef.current,ts=timeSignatureRef.current,sPBSync=songDataRef.current[1]?.length||DEFAULT_NUM_BEATS_PER_BAR_CONST,sPMBSync=ts.beatsPerBar > 0 ? sPBSync/ts.beatsPerBar : sPBSync; if(effBPM>0&&sPMBSync>0){const secPS=(60/effBPM)/sPMBSync; if(secPS>0)lSTS=globalLoopStartTick*sPS;}} if(lSTS<mediaDuration-0.1){mediaEl.currentTime=lSTS;mediaEl.play().catch(e=>console.error("Media loop replay err:",e));if(!isSequencerPlayingRef.current)setIsSequencerPlaying(true);return;}} await coreHandleStop();}}; const hEr=(e)=>{console.error("Media Err:",e);toast.error("Media playback error.");setIsMediaActuallyPlaying(false);if(appMode===MODE_SYNC)coreHandleStop();};
    mediaEl.addEventListener('loadedmetadata',hLM);mediaEl.addEventListener('timeupdate',hTU);mediaEl.addEventListener('play',hP);mediaEl.addEventListener('pause',hPs);mediaEl.addEventListener('ended',hE);mediaEl.addEventListener('error',hEr);
    return ()=>{mediaEl.removeEventListener('loadedmetadata',hLM);mediaEl.removeEventListener('timeupdate',hTU);mediaEl.removeEventListener('play',hP);mediaEl.removeEventListener('pause',hPs);mediaEl.removeEventListener('ended',hE);mediaEl.removeEventListener('error',hEr); if(localSourceNode){try{localSourceNode.disconnect();}catch(e){}if(sourceNodeRef.current===localSourceNode)sourceNodeRef.current=null;} if(localAnalyserNode){try{localAnalyserNode.disconnect();}catch(e){}if(analyserRef.current===localAnalyserNode){analyserRef.current=null;dataArrayRef.current=null;}}};
  }, [mediaSrc, appMode, audioInitialized, soundsPreloaded, mediaOriginalBPM, mediaFile, contextBpm, contextTimeSignature, songData, isLooping, mediaDuration, globalLoopStartTick, coreHandleStop, coreHandleDetectMediaBPM, convertGlobalTickToBarBeat, calculateGlobalTick, managerPlaySound]);

  // UI Display Update for Bar/Beat
  useEffect(() => {
    const currentBar = currentPlayingBarRef.current || 1; const currentStep = currentSequencerPlayBeatRef.current || 0;
    setCurrentBarDisplayForPlayback(currentBar);
    const musicalBeatsInBar = timeSignatureRef.current.beatsPerBar || 4; const stepsPerPhysicalBar = DEFAULT_NUM_BEATS_PER_BAR_CONST;
    const stepsPerMusicalBeat = musicalBeatsInBar > 0 ? stepsPerPhysicalBar / musicalBeatsInBar : stepsPerPhysicalBar;
    const musicalBeatDisplay = Math.floor(currentStep / stepsPerMusicalBeat) + 1;
    setCurrentBeatDisplayForPlayback(isNaN(musicalBeatDisplay) || musicalBeatDisplay < 1 ? 1 : musicalBeatDisplay);
  }, [currentPlayingBar, currentSequencerPlayBeat, contextTimeSignature]);

  // Notation Text Update
  useEffect(() => {
    setNotationText(generateNotationForBeat(displayBarForUI, displayBeatIndexForUI, beatDataForUIDisplay, mainTimecodeParts));
  }, [displayBarForUI, displayBeatIndexForUI, beatDataForUIDisplay, mainTimecodeParts]);
  
  // Keyboard Shortcuts - REVISED LOGIC
  useEffect(() => {
    logToConsole('[KB] Keyboard Shortcuts useEffect attaching. isInputFocused:', isInputFocused, 'isPoseEditorModalOpen:', isPoseEditorModalOpen);
    const handleKeyDown = (event) => {
      const targetTagName = event.target?.tagName?.toLowerCase(); 
      const activeElementIsInput = targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select' || event.target.isContentEditable;
      const key = event.key.toLowerCase(); 
      const ctrlOrMeta = event.ctrlKey || event.metaKey; 
      const shift = event.shiftKey; 
      const alt = event.altKey;

      if (key === 'escape') { 
        event.preventDefault(); 
        if (isPoseEditorModalOpen) setIsPoseEditorModalOpen(false); 
        else if (isSequencerPlayingRef.current) wrappedPlaybackHandlers.onStop(); 
        else if (activeEditingJointRef.current) setActiveEditingJoint(null); 
        else if (activeBeatIndex !== 0) setActiveBeatIndex(0);
        return; 
      }
      
      if (activeElementIsInput && !(ctrlOrMeta && key === 's' && !isPoseEditorModalOpen)) {
         if (isPoseEditorModalOpen && key === 'enter' && (targetTagName === 'input' || targetTagName === 'textarea') ) {
            event.target.blur(); 
          }
        return;
      }
      
      let shortcutHandled = false;

      if (key === 'tab' && !ctrlOrMeta && !alt && !shift && !isPoseEditorModalOpen) {
        event.preventDefault();
        if (appModeRef.current === MODE_POS) {
          handleModeChange(MODE_SEQ);
        } else if (appModeRef.current === MODE_SEQ) {
          handleModeChange(MODE_POS);
        }
        shortcutHandled = true;
      }
      if (shortcutHandled) return;

      if (appModeRef.current === MODE_POS && (!isPoseEditorModalOpen || (isPoseEditorModalOpen && !activeElementIsInput))) {
        if (!ctrlOrMeta && !alt && !shift) {
          let jointToSelect = null;
          switch (key) {
            case 'a': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_SHO')?.abbrev; break;
            case 'z': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_SHO')?.abbrev; break;
            case 's': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_ELB')?.abbrev; break;
            case 'x': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_ELB')?.abbrev; break;
            case 'd': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_WRST')?.abbrev; break;
            case 'c': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_WRST')?.abbrev; break;
            case 'f': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_HIP')?.abbrev; break;
            case 'v': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_HIP')?.abbrev; break;
            case 'g': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_KNEE')?.abbrev; break;
            case 'b': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_KNEE')?.abbrev; break;
            case 'h': jointToSelect = UI_LEFT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='L_ANK')?.abbrev; break;
            case 'n': jointToSelect = UI_RIGHT_JOINTS_ABBREVS_NEW.find(j=>j.abbrev==='R_ANK')?.abbrev; break;
            default: break;
          }
          if (jointToSelect) { handleJointSelect(jointToSelect); shortcutHandled = true; }
        }
        if (activeEditingJointRef.current && !ctrlOrMeta && !alt) {
          const nA=0.05; let aN=false;
          switch (key) {
            case 'arrowup':   aN=true; if(shift)coreHandleNudgeJointPosition('z',1,nA*(isShiftActive?2:1));else coreHandleNudgeJointPosition('y',1,nA*(isShiftActive?2:1)); break;
            case 'arrowdown': aN=true; if(shift)coreHandleNudgeJointPosition('z',-1,nA*(isShiftActive?2:1));else coreHandleNudgeJointPosition('y',-1,nA*(isShiftActive?2:1)); break;
            case 'arrowleft': aN=true; coreHandleNudgeJointPosition('x',-1,nA*(isShiftActive?2:1)); break;
            case 'arrowright':aN=true; coreHandleNudgeJointPosition('x',1,nA*(isShiftActive?2:1)); break;
            default: break;
          }
          if(aN) shortcutHandled=true;
        }
      }
      if (shortcutHandled) { event.preventDefault(); return; }

      if (!isPoseEditorModalOpen && (appMode === MODE_SEQ || appMode === MODE_POS) && !ctrlOrMeta && !alt && !shift) {
          const beatPadKeysRow1 = ['1','2','3','4','5','6','7','8']; 
          const beatPadKeysRow2 = ['q','w','e','r','t','y','u','i']; 
          let beatIndexToSelect = -1;
          if (beatPadKeysRow1.includes(key)) beatIndexToSelect = beatPadKeysRow1.indexOf(key);
          else if (beatPadKeysRow2.includes(key)) beatIndexToSelect = beatPadKeysRow2.indexOf(key) + 8;

          if (beatIndexToSelect !== -1 && beatIndexToSelect < DEFAULT_NUM_BEATS_PER_BAR_CONST) {
            setActiveBeatIndex(beatIndexToSelect); 
            logToConsole(`[KB] Beat pad ${beatIndexToSelect + 1} selected via key '${key}'.`);

            if (appMode === MODE_SEQ && !isSequencerPlaying) { // Only play if in SEQ mode AND not currently playing
                if (audioInitialized && soundsPreloaded) {
                    const sounds = songDataRef.current[currentEditingBarRefForKeyboard.current]?.[beatIndexToSelect]?.sounds;
                    if (sounds?.length > 0) {
                        logToConsole(`[KB] Playing sounds for selected beat ${beatIndexToSelect + 1}:`, sounds);
                        sounds.forEach(sKey => { if (tr808SoundFiles[sKey]) managerPlaySound(tr808SoundFiles[sKey]); });
                    } else {
                        logToConsole(`[KB] No sounds on selected beat ${beatIndexToSelect + 1} to play.`);
                    }
                }
            } else if (appMode === MODE_POS) {
              // If modal is not open, open it. If already open, this selection might update its content.
              if (!isPoseEditorModalOpen) setIsPoseEditorModalOpen(true);
            }
            shortcutHandled = true;
          }
      }
      if (shortcutHandled) { event.preventDefault(); return; }

      // ... CTRL + BeatPadKey for deleting sound (example: delete last sound)
      if (!isPoseEditorModalOpen && appMode === MODE_SEQ && ctrlOrMeta && !shift && !alt) { // CTRL/CMD + Key
          const beatPadKeysRow1 = ['1','2','3','4','5','6','7','8']; 
          const beatPadKeysRow2 = ['q','w','e','r','t','y','u','i']; 
          let beatIndexToModify = -1;
          if (beatPadKeysRow1.includes(key)) beatIndexToModify = beatPadKeysRow1.indexOf(key);
          else if (beatPadKeysRow2.includes(key)) beatIndexToModify = beatPadKeysRow2.indexOf(key) + 8;

          if (beatIndexToModify !== -1 && beatIndexToModify < DEFAULT_NUM_BEATS_PER_BAR_CONST) {
              const soundsOnBeat = songDataRef.current[currentEditingBarRefForKeyboard.current]?.[beatIndexToModify]?.sounds;
              if (soundsOnBeat && soundsOnBeat.length > 0) {
                  const lastSound = soundsOnBeat[soundsOnBeat.length - 1];
                  logToConsole(`[KB] Ctrl + BeatPadKey: Deleting last sound "${lastSound}" from beat ${beatIndexToModify + 1}`);
                  coreHandleDeleteSoundFromBeat(beatIndexToModify, lastSound);
              } else {
                  toast.info("No sounds to delete on this beat.");
              }
              shortcutHandled = true;
          }
      }
    };
    const handleGlobalFocus=(e)=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT'||e.target.isContentEditable){setIsInputFocused(true);logToConsole('[KB] Input focused');}}; const handleGlobalBlur=(e)=>{if(!e.relatedTarget||(e.relatedTarget.tagName!=='INPUT'&&e.relatedTarget.tagName!=='TEXTAREA'&&e.relatedTarget.tagName!=='SELECT'&&!e.relatedTarget.isContentEditable)){setIsInputFocused(false);logToConsole('[KB] Input blurred');}};
    document.addEventListener('keydown',handleKeyDown);document.addEventListener('focusin',handleGlobalFocus);document.addEventListener('focusout',handleGlobalBlur);
    return ()=>{document.removeEventListener('keydown',handleKeyDown);document.removeEventListener('focusin',handleGlobalFocus);document.removeEventListener('focusout',handleGlobalBlur);logToConsole('[KB] Keyboard cleanup.');};
  }, [isInputFocused, isPoseEditorModalOpen, activeEditingJoint, isShiftActive, wrappedPlaybackHandlers, handleModeChange, handleJointSelect, handleSaveSequenceLocal, coreHandleNudgeJointPosition, appMode, isSequencerPlaying, seqrFileInputRef, setIsPoseEditorModalOpen, setActiveBeatIndex, setIsInputFocused, logToConsole, currentSoundInBankRef, audioInitialized, soundsPreloaded, currentEditingBarRefForKeyboard, songDataRef, coreHandleAddSoundToBeat, managerPlaySound]);


  // SECTION 9: JSX RETURN
  return (
    <div className="w-full min-h-screen bg-gray-950 text-gray-300 flex justify-center p-2">
      <div className="w-full max-w-6xl h-full flex flex-col space-y-1 sm:space-y-1.5">
        <div className="relative flex flex-wrap justify-between items-center gap-1 sm:gap-2 p-1 sm:p-1.5 bg-gray-800/90 rounded-lg shadow-md min-h-[3rem] sm:min-h-[3.25rem] flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <LoadSave
                onSave={handleSaveSequenceLocal}
                onLoad={handleLoadSequenceLocal}
                onNewSequence={handleNewSequenceLocal} /* Prop name corrected */
                currentFilename={currentFilename}
                onFilenameChange={setCurrentFilename}
                seqrFileInputRef={seqrFileInputRef}
                buttonSize="sm" /* Changed from "xs" to "sm" */
                compact={true}
              />
              <FileUploader 
                onFileSelect={handleFileSelectedForMedia} /* Prop name corrected */
                mediaFileInputRef={mediaFileInputRef} 
                buttonSize="sm" /* Changed from "xs" to "sm" */
                compact={true} 
              />
            </div>
            <div className="flex-grow flex items-center justify-center px-2">
                <SoundBank
                    availableKits={Object.keys(soundKitsData)}
                    selectedKit={selectedSoundKitName}
                    onKitSelect={handleKitSelect}

                    currentSoundInKit={currentSoundInBank} // This is the sound key within the selected kit
                    onSoundInKitSelect={handleSoundBankSelect} // This is your existing coreHandleSoundBankSelect or its wrapped version
                    
                    soundsForSelectedKit={selectedSoundKitName ? soundKitsData[selectedSoundKitName]?.soundKeys : []}
                    fileMapForSelectedKit={selectedSoundKitName ? soundKitsData[selectedSoundKitName]?.fileMap : {}}
                    
                    isCompact={true} // or dynamically set
                    logToConsole={logToConsole}
                />
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="Pose Mode (1)" wrapperElementType="span">
                <Button onClick={() => handleModeChange(MODE_POS)} variant={appMode === MODE_POS ? "primary" : "secondary"} size="sm" iconLeft={faUserEdit} className={appMode === MODE_POS ? '!bg-brand-pos' : ''}>POS</Button>
              </Tooltip>
              <Tooltip content="Sequence Mode (2)" wrapperElementType="span">
                <Button onClick={() => handleModeChange(MODE_SEQ)} variant={appMode === MODE_SEQ ? "primary" : "secondary"} size="sm" iconLeft={faDrum} className={appMode === MODE_SEQ ? '!bg-brand-seq' : ''}>SEQ</Button>
              </Tooltip>
              <Tooltip content="Sync Mode (3)" wrapperElementType="span">
                <Button onClick={() => handleModeChange(MODE_SYNC)} variant={appMode === MODE_SYNC ? "primary" : "secondary"} size="sm" iconLeft={faSyncAlt} className={appMode === MODE_SYNC ? '!bg-brand-sync' : ''}>SYNC</Button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
                <Tooltip content="Toggle Main Skeletal Overlay" wrapperElementType="span"><Button onClick={() => setShowMainPoseVisualizerAsOverlay(p => !p)} variant="icon" size="sm" className={showMainPoseVisualizerAsOverlay ? 'text-yellow-400' : 'text-gray-400'}><FontAwesomeIcon icon={faPersonRunning}/></Button></Tooltip>
                 <Tooltip content="Toggle Main Core Visualizer" wrapperElementType="span"><Button onClick={() => setShowMainCoreVisualizer(p => !p)} variant="icon" size="sm" className={showMainCoreVisualizer ? 'text-yellow-400' : 'text-gray-400'}><FontAwesomeIcon icon={faAtom}/></Button></Tooltip>
                <Tooltip content="Toggle Skeleton Lines" wrapperElementType="span"><Button onClick={() => setShowSkeletonLines(p => !p)} variant="icon" size="sm" className={showSkeletonLines ? 'text-yellow-400' : 'text-gray-400'}><FontAwesomeIcon icon={showSkeletonLines ? faEye : faEyeSlash}/></Button></Tooltip>
            </div>
        </div>
        
        <div className="w-full flex flex-col items-center gap-2 sm:gap-3 my-1 sm:my-1.5 flex-shrink-0">
          <div className="flex flex-col items-center p-2 bg-gray-800/70 rounded-md shadow-inner w-full border border-gray-700/50">
            <div className="w-full space-y-2">
              {Array.from({ length: numRowsForGrid }).map((_, rowIndex) => (
                <div key={`beat-row-${currentEditingBar}-${rowIndex}`} className="grid grid-cols-8 gap-2">
                  {currentBarDataForGrid.slice(rowIndex * BEATS_PER_ROW_DISPLAY, (rowIndex + 1) * BEATS_PER_ROW_DISPLAY)
                    .map((beat, indexInRow) => {
                      const beatIndexAbs = rowIndex * BEATS_PER_ROW_DISPLAY + indexInRow;
                      return (
                        <BeatButton
                          key={`beat-${currentEditingBar}-${beatIndexAbs}`} beatData={beat} beatIndex={beatIndexAbs} appMode={appMode}
                          isSelectedForEdit={appMode === MODE_POS && activeBeatIndex === beatIndexAbs}
                          isCurrentlySelectedInSeqMode={appMode === MODE_SEQ && activeBeatIndex === beatIndexAbs}
                          isCurrentlyPlayingAtBeat={isSequencerPlaying && currentPlayingBar === currentEditingBar && currentSequencerPlayBeat === beatIndexAbs}
                          isPlayheadPositionWhenPaused={!isSequencerPlaying && sequencerWasActive && currentPlayingBar === currentEditingBar && currentSequencerPlayBeat === beatIndexAbs}
                          onClick={handleBeatClicked} onAddSound={handleAddSoundToBeatClicked} onDeleteSound={handleDeleteSoundFromBeatClicked} currentSoundInBank={currentSoundInBank}
                          logToConsole={logToConsole}
                        />);})}
                </div>))}
            </div>
          </div>
          <div className="w-full p-0 bg-transparent rounded-md flex items-center justify-center flex-shrink-0"> 
            <PlaybackControls {...wrappedPlaybackHandlers} bpm={contextBpm ?? DEFAULT_BPM} onBpmChange={handlePbBpmChange} isPlaying={isSequencerPlaying} isLooping={isLooping} currentBar={currentBarDisplayForPlayback} currentBeatInBar={currentBeatDisplayForPlayback} skipIntervalDenominator={skipIntervalDenominator} onSkipIntervalChange={handlePbSkipIntervalChange} mainTimecodeParts={mainTimecodeParts} currentSongBar={currentEditingBar} totalBars={totalBars} isShiftActive={isShiftActive} onToggleShift={coreHandleToggleShift} appMode={appMode} mediaSrc={mediaSrc} mediaOriginalBPM={mediaOriginalBPM} onMediaOriginalBPMChange={handlePbMediaOriginalBPMChange} isDetectingBPM={isDetectingBPM} timeSignature={contextTimeSignature ?? DEFAULT_TIME_SIGNATURE} onTimeSignatureChange={handlePbTimeSignatureChange} logToConsole={logToConsole} /> 
          </div>
        </div>

        <div className="my-1 sm:my-1.5 p-2 sm:p-3 bg-gray-800/70 rounded-lg shadow-inner h-[10em] sm:h-[11em] flex flex-col flex-shrink-0">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-1 sm:mb-1.5 font-orbitron text-center shrink-0"> Live Notation (Bar {displayBarForUI}, Beat {displayBeatIndexForUI + 1}) </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 text-xxs sm:text-xs leading-relaxed flex-grow min-h-0">
             <div className="bg-gray-900/60 p-1.5 sm:p-2 rounded overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent h-full"><p className="font-mono whitespace-pre-wrap break-words text-yellow-400/90">Shorthand: {notationText.shorthand}</p></div>
             <div className="bg-gray-900/60 p-1.5 sm:p-2 rounded overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent h-full"><p className="whitespace-pre-wrap break-words text-blue-300/90">Plain English: {notationText.plainEnglish}</p></div>
             <div className="bg-gray-900/60 p-1.5 sm:p-2 rounded overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent h-full"><p className="whitespace-pre-wrap break-words text-green-300/90">Biomechanical: {notationText.analysis}</p></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col min-h-0 mt-1">
           <div className="w-full mx-auto flex-grow flex flex-col min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] lg:grid-cols-[minmax(100px,auto)_1fr_minmax(100px,auto)] gap-x-1 sm:gap-x-1.5 items-stretch flex-grow min-h-0">
              <div className="flex justify-center md:justify-start py-1 self-stretch mt-1 md:mt-2 order-1 md:order-1 bg-gray-800/30 rounded-lg p-1"> <SideJointSelector side="L" jointsList={UI_LEFT_JOINTS_ABBREVS_NEW} activeJoint={activeEditingJoint} onJointSelect={handleJointSelect} appMode={appMode} programmedJoints={programmedJointsForUI} currentBeatJointInfo={beatDataForUIDisplay.jointInfo || {}}/> </div>
              <div ref={mainVisualizerAreaRef} className="relative flex flex-col items-center justify-center w-full gap-y-1 sm:gap-y-1.5 min-h-[250px] sm:min-h-[300px] md:min-h-0 px-0 py-1 order-last md:order-2 self-stretch md:pt-1 bg-gray-800/20 rounded-md">
                <div className="flex flex-row items-center justify-around w-full h-[35%] sm:h-[40%] max-h-[250px] gap-x-0.5 sm:gap-x-1 flex-shrink-0">
                    <div className={`flex-shrink-0 flex items-center justify-center ${MAIN_FOOT_DISPLAY_SIZE_CLASSES}`}><FootDisplay side="L" groundPoints={leftFootGroundingForUI} type="image" sizeClasses="w-full h-full" rotation={leftFootRotationForUI} /></div>
                    <div className="relative flex-grow self-stretch shadow-lg rounded-md overflow-hidden mx-0.5 sm:mx-1 bg-black min-w-[100px] aspect-[9/16]">
                        <VideoMediaPlayer mediaSrc={mediaSrc} mediaType={mediaType} ref={mediaInteractionRef} className="absolute inset-0 w-full h-full object-contain rounded-md" />
                        {mediaSrc && (appMode === MODE_SYNC || appMode === MODE_POS) && (<MotionTrackingOverlay mediaInteractionRef={mediaInteractionRef} isPlaying={isMediaActuallyPlaying} currentTime={mediaCurrentTime} duration={mediaDuration} onMarkKeyframe={handleMarkKeyframeAction} currentKeyframes={currentKeyframes} onDeleteKeyframe={handleDeleteKeyframeAction} logToConsole={logToConsole} />)}
                        {showMainPoseVisualizerAsOverlay && (<div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"><SkeletalPoseVisualizer2D jointInfoData={beatDataForUIDisplay?.jointInfo || {}} highlightJoint={activeEditingJoint} width={mainVisualizerAreaRef.current?.clientWidth ? mainVisualizerAreaRef.current.clientWidth * 0.85 : 280} height={mainVisualizerAreaRef.current?.clientHeight ? mainVisualizerAreaRef.current.clientHeight * 0.85 : 380} showLines={showSkeletonLines} /* onJointClick={handleJointSelect} */ className="bg-transparent opacity-80" /></div>)}
                        {showMainCoreVisualizer && (<div className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto ${!mediaSrc || showMainPoseVisualizerAsOverlay ? 'bg-gray-800/90' : 'bg-black/60 backdrop-blur-sm'}`}><CoreDynamicsVisualizer coreJointData={beatDataForUIDisplay?.jointInfo || {}} beatGrounding={beatDataForUIDisplay?.grounding || { L: null, R: null, L_weight: 50 }} onCoreInputChange={(joint, prop, val) => logToConsole(`MainCoreViz Display Only: ${joint} ${prop}=${val}`)} /></div>)}
                    </div>
                    <div className={`flex-shrink-0 flex items-center justify-center ${MAIN_FOOT_DISPLAY_SIZE_CLASSES}`}><FootDisplay side="R" groundPoints={rightFootGroundingForUI} type="image" sizeClasses="w-full h-full" rotation={rightFootRotationForUI} /></div>
                </div>
                {appMode === MODE_SYNC && mediaSrc && mediaDuration > 0 && (<div className="w-full h-[50px] sm:h-[60px] mt-1 sm:mt-1.5 px-1 flex-shrink-0"> <AudioBeatVisualizer isPlaying={isMediaActuallyPlaying} appMode={appMode} timeSignature={contextTimeSignature ?? DEFAULT_TIME_SIGNATURE} mediaElement={mediaInteractionRef.current} mediaDuration={mediaDuration} mediaCurrentTime={mediaCurrentTime} sequencerCurrentBar={currentPlayingBar} sequencerCurrentBeatIndex={currentSequencerPlayBeat} songData={songData} NUM_BEATS_PER_BAR={contextTimeSignature?.beatsPerBar ?? DEFAULT_TIME_SIGNATURE.beatsPerBar} resolution={INTERNAL_SEQUENCER_RESOLUTION} sequencerWasActive={sequencerWasActive} onSeek={handleSeekAction} loopStartGlobalTick={globalLoopStartTick} loopEndGlobalTick={globalLoopEndTick} analyserNode={analyserRef.current} audioDataArray={dataArrayRef.current} /> </div>)}
              </div>
              <div className="flex justify-center md:justify-end py-1 self-stretch mt-1 md:mt-2 order-3 md:order-3 bg-gray-800/30 rounded-lg p-1"> <SideJointSelector side="R" jointsList={UI_RIGHT_JOINTS_ABBREVS_NEW} activeJoint={activeEditingJoint} onJointSelect={handleJointSelect} appMode={appMode} programmedJoints={programmedJointsForUI} currentBeatJointInfo={beatDataForUIDisplay.jointInfo || {}}/> </div>
            </div>
          </div>
        </div>
      </div>

      {appMode === MODE_SEQ && activeBeatIndex !== null && ( <div className="bg-gray-800/80 p-1.5 sm:p-2 rounded-md text-xs text-center mt-1 shadow flex-shrink-0"> Editing: Bar {currentEditingBar}, Step {activeBeatIndex + 1} {currentSoundInBank && ` (Sound: ${getSoundNameFromPath(tr808SoundFiles[currentSoundInBank])})`} </div> )}
      
      {isPoseEditorModalOpen && appMode === MODE_POS && activeBeatIndex !== null && currentEditingBar && (
        <PoseEditorModalComponent
          isOpen={isPoseEditorModalOpen} onClose={() => setIsPoseEditorModalOpen(false)} initialBeatDataForModal={beatDataForModal} initialActiveJointAbbrev={activeEditingJoint}
          currentBarSongData={songData[currentEditingBar] || createNewBarData()} onModalBeatSelect={handleModalBeatSelect} {...modalSaveHandlers}
          logToConsoleFromParent={logToConsole} currentShowSkeletonLinesState={showSkeletonLines} onToggleSkeletonLinesInModal={() => setShowSkeletonLines(p => !p)} onJointSelectInModal={handleJointSelect}
        />)}
    </div>
  );
};

export default StepSequencerControls;