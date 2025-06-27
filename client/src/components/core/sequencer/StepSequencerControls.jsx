import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Child Components
import BeatButton from './BeatButton';
import SoundBank from './SoundBank';
import PlaybackControls from '../transport/PlaybackControls';
import SkeletalPoseVisualizer2D from '../pose_editor/SkeletalPoseVisualizer2D';
import SideJointSelector from '../pose_editor/SideJointSelector';
import { JointInputPanel } from '../pose_editor/JointInputPanel';
import FootDisplay from '../pose_editor/FootDisplay';
import VideoMediaPlayer from '../media/VideoMediaPlayer';
import LoadSave from '../../common/LoadSave';
import HipWeightIndicator from '../../common/HipWeightIndicator';
import Crossfader from '../../common/Crossfader';
import RotationKnob from '../../common/RotationKnob';
import Button from '../../common/Button';
import TransitionEditor from '../pose_editor/TransitionEditor';
import DirectionalPad from '../../common/DirectionalPad';

// Utils, Contexts, Constants, Hooks
import * as audioManager from '../../../utils/audioManager';
import { useAuth } from '../../../hooks/useAuth';
import { useSequencerSettings } from '../../../contexts/SequencerSettingsContext';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';
import { useWebMidi } from '../../../hooks/useWebMidi';
import { useBpmDetection } from '../../../hooks/useBpmDetection';
import { calculateCurvedValue, lerp, lerpVector } from '../../../utils/helpers';
import { generateNotationForBeat } from '../../../utils/notationUtils';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faTimes, faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  DEFAULT_BPM, MODES, AVAILABLE_KITS, DEFAULT_SOUND_KIT, INITIAL_SONG_DATA,
  DEFAULT_TIME_SIGNATURE, createDefaultBeatObject, UI_PADS_PER_BAR,
  MAX_SOUNDS_PER_BEAT, SKIP_OPTIONS, UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW,
  BPM_MIN, BPM_MAX, KEYBOARD_LAYOUT_MODE_SEQ, TAP_TEMPO_MIN_TAPS, TAP_TEMPO_MAX_INTERVAL_MS,
  KEYBOARD_FOOT_GROUNDING, KEYBOARD_TRANSPORT_CONTROLS, KEYBOARD_MODE_SWITCH, KEYBOARD_NAVIGATION_POS_MODE, KEYBOARD_JOINT_NUDGE_CONTROLS
} from '../../../utils/constants';

const logDebug = (level, ...args) => console[level] ? console[level](...args) : console.log(...args);

const StepSequencerControls = () => {
  // --- STATE DECLARATIONS ---
  const [songData, setSongData] = useState(() => JSON.parse(JSON.stringify(INITIAL_SONG_DATA)));
  const [history, setHistory] = useState(() => [JSON.stringify(INITIAL_SONG_DATA)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  const [bpm, setBpm] = useState(() => DEFAULT_BPM);
  const [selectedKitName, setSelectedKitName] = useState(() => DEFAULT_SOUND_KIT.name);
  const [currentSoundInBank, setCurrentSoundInBank] = useState(null);
  const [viewMode, setViewMode] = useState(MODES.POS);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [currentEditingBar, setCurrentEditingBar] = useState(0);
  const [activeEditingJoint, setActiveEditingJoint] = useState(null);
  const [isLoadingSounds, setIsLoadingSounds] = useState(true);
  const [errorLoadingSounds, setErrorLoadingSounds] = useState(null);
  const [notationText, setNotationText] = useState({ shorthand: "N/A", plainEnglish: "N/A", analysis: "N/A" });
  const [mainTimecodeParts, setMainTimecodeParts] = useState({ mm: '00', ss: '00', cs: '00' });
  const [copiedBarData, setCopiedBarData] = useState(null);
  const [copiedPoseData, setCopiedPoseData] = useState(null);
  const [mediaSrcUrl, setMediaSrcUrl] = useState(null);
  const [loadedMediaFile, setLoadedMediaFile] = useState(null);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [currentSequenceFilename, setCurrentSequenceFilename] = useState('untitled.seq');
  const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(true);
  const [leftFootRotation, setLeftFootRotation] = useState(0);
  const [rightFootRotation, setRightFootRotation] = useState(0);
  const [wheelMode, setWheelMode] = useState('ROT');
  const [sequencerWasActive, setSequencerWasActive] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStartPoint, setLoopStartPoint] = useState(null);
  const [loopEndPoint, setLoopEndPoint] = useState(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [skipIntervalDenominator, setSkipIntervalDenominator] = useState(16);
  const [mediaOriginalBPM, setMediaOriginalBPM] = useState('');
  const [curveKnobValue, setCurveKnobValue] = useState(50);
  const [transitionStartBeat, setTransitionStartBeat] = useState(0);
  const [transitionEndBeat, setTransitionEndBeat] = useState(1);
  const [captureResolution, setCaptureResolution] = useState(16);
  const [livePoseData, setLivePoseData] = useState(null);

  // --- REFS ---
  const videoPlayerRef = useRef(null);
  const songDataRef = useRef(songData);
  const isPlayingRef = useRef(isPlaying);
  const intervalRef = useRef(null);
  const currentStepRef = useRef(currentStep);
  const currentBarRef = useRef(currentBar);
  const centralColumnRef = useRef(null);
  const isLoopingRef = useRef(isLooping);
  const loopStartPointRef = useRef(loopStartPoint);
  const loopEndPointRef = useRef(loopEndPoint);
  const bpmRef = useRef(bpm);
  const tapTempoDataRef = useRef({ timestamps: [], timer: null });
  
  // --- CONTEXT & MEMOS ---
  const { user: currentUser } = useAuth() || {};
  const { bpm: contextBpm, setBpm: setContextBpm, timeSignature: contextTimeSignature, setTimeSignature } = useSequencerSettings();
  const musicalBeatsPerBar = useMemo(() => contextTimeSignature?.beatsPerBar || DEFAULT_TIME_SIGNATURE.beatsPerBar, [contextTimeSignature]);
  const totalBarsInSequence = useMemo(() => songData.length, [songData]);
  const uiPadsToRender = useMemo(() => UI_PADS_PER_BAR, []);
  const soundKitsObject = useMemo(() => AVAILABLE_KITS.reduce((acc, kit) => { acc[kit.name] = kit; return acc; }, {}), []);
  const currentSelectedKitObject = useMemo(() => soundKitsObject[selectedKitName] || soundKitsObject[DEFAULT_SOUND_KIT.name], [soundKitsObject, selectedKitName]);
  const currentBarBeatsForUI = useMemo(() => (songData[currentEditingBar]?.beats) || [], [songData, currentEditingBar]);
  const beatDataForActiveSelection = useMemo(() => currentBarBeatsForUI[activeBeatIndex] || createDefaultBeatObject(activeBeatIndex), [currentBarBeatsForUI, activeBeatIndex]);
  const mainLeftGrounding = useMemo(() => beatDataForActiveSelection.grounding?.L ?? null, [beatDataForActiveSelection]);
  const mainRightGrounding = useMemo(() => beatDataForActiveSelection.grounding?.R ?? null, [beatDataForActiveSelection]);
  const activePoseData = useMemo(() => isPlaying ? songDataRef.current[currentBar]?.beats[currentStep] : beatDataForActiveSelection, [isPlaying, currentBar, currentStep, beatDataForActiveSelection]);
  const beatTimecodes = useMemo(() => { const timecodes = []; if (bpm <= 0) return []; const timePerBeat = 60 / bpm; for (let bar = 0; bar < totalBarsInSequence; bar++) { for (let beat = 0; beat < uiPadsToRender; beat++) { const absoluteBeat = (bar * uiPadsToRender) + beat; const currentTime = absoluteBeat * (timePerBeat / (uiPadsToRender / musicalBeatsPerBar)); const minutes = Math.floor(currentTime / 60); const seconds = Math.floor(currentTime % 60); const centiseconds = Math.floor((currentTime * 100) % 100); timecodes.push({ mm: String(minutes).padStart(2, '0'), ss: String(seconds).padStart(2, '0'), cs: String(centiseconds).padStart(2, '0'), }); } } return timecodes; }, [bpm, totalBarsInSequence, uiPadsToRender, musicalBeatsPerBar]);

  // --- CUSTOM HOOKS ---
  const { isDetecting: isDetectingBpm, detectedBpm, detectBpm } = useBpmDetection();
  const { isAnalyzing, analysisProgress, startAnalysis, cancelAnalysis, startLiveTracking, stopLiveTracking } = useMotionAnalysis({ onPoseUpdate: setLivePoseData, onKeyframeData: (keyframeData) => { updateSongDataAndHistory(currentData => { const newSongData = Array(totalBarsInSequence).fill(null).map((_, barIndex) => ({ id: barIndex, beats: Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex)) })); keyframeData.forEach(frame => { if (newSongData[frame.bar] && newSongData[frame.bar].beats[frame.beat]) { newSongData[frame.bar].beats[frame.beat].jointInfo = frame.poseData.jointInfo; newSongData[frame.bar].beats[frame.beat].thumbnail = frame.poseData.thumbnail; } }); return newSongData; }); toast.success("Motion analysis complete."); }, logDebug, });
  
  // --- REF SYNCHRONIZATION ---
  useEffect(() => { songDataRef.current = songData; }, [songData]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { currentBarRef.current = currentBar; }, [currentBar]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { loopStartPointRef.current = loopStartPoint; }, [loopStartPoint]);
  useEffect(() => { loopEndPointRef.current = loopEndPoint; }, [loopEndPoint]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // --- CORE HANDLERS ---
  const makeDeepCopy = useCallback((data) => JSON.parse(JSON.stringify(data)), []);
  const updateSongDataAndHistory = useCallback((newDataProducer) => { setSongData(currentData => { const newData = newDataProducer(makeDeepCopy(currentData)); const currentStateString = history[historyIndex]; const newStateString = JSON.stringify(newData); if (currentStateString !== newStateString) { const newHistory = history.slice(0, historyIndex + 1); newHistory.push(newStateString); setHistory(newHistory); setHistoryIndex(newHistory.length - 1); } return newData; }); }, [history, historyIndex]);
  const handleUndo = useCallback(() => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); setSongData(JSON.parse(history[newIndex])); toast.info("Undo"); } }, [history, historyIndex]);
  const handleRedo = useCallback(() => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); setSongData(JSON.parse(history[newIndex])); toast.info("Redo"); } }, [history, historyIndex]);
  const coreHandleBpmChange = useCallback((val) => { const parsedBpm = parseInt(val, 10); if (!isNaN(parsedBpm) && parsedBpm >= BPM_MIN && parsedBpm <= BPM_MAX) { const clampedBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, parsedBpm)); setBpm(clampedBpm); if (setContextBpm) setContextBpm(clampedBpm); } }, [setContextBpm]);
  const handleSaveSequence = useCallback(() => { try { const sequenceData = { version: '1.0.0', bpm, timeSignature: contextTimeSignature, songData }; const dataStr = JSON.stringify(sequenceData, null, 2); const blob = new Blob([dataStr], {type: "application/json;charset=utf-8"}); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; const filename = currentSequenceFilename.endsWith('.json') ? currentSequenceFilename : `${currentSequenceFilename}.seq`; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); toast.success(`Sequence saved.`); } catch (error) { toast.error("Could not save sequence."); } }, [songData, bpm, contextTimeSignature, currentSequenceFilename]);
  const handleLoadSequence = useCallback((file) => { if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const data = JSON.parse(e.target.result); if (!data.songData) throw new Error("Invalid file format."); setSongData(data.songData); setHistory([JSON.stringify(data.songData)]); setHistoryIndex(0); const newBpm = data.bpm || DEFAULT_BPM; setBpm(newBpm); if(setContextBpm) setContextBpm(newBpm); const newSig = data.timeSignature || DEFAULT_TIME_SIGNATURE; if(setTimeSignature) setTimeSignature(newSig); setCurrentSequenceFilename(file.name.replace(/\.(json|seq)$/, '')); toast.success(`Sequence loaded.`); } catch (error) { toast.error(error.message); } }; reader.readAsText(file); }, [setContextBpm, setTimeSignature]);
  const handleMediaFileSelected = useCallback((file) => { if (mediaSrcUrl) URL.revokeObjectURL(mediaSrcUrl); setLoadedMediaFile(file); const url = URL.createObjectURL(file); setMediaSrcUrl(url); const tempMediaElement = document.createElement('video'); tempMediaElement.src = url; tempMediaElement.onloadedmetadata = () => { setMediaDuration(tempMediaElement.duration); const beatsPerSecond = bpm / 60; const totalBeats = tempMediaElement.duration * beatsPerSecond; const totalSteps = totalBeats * (uiPadsToRender / musicalBeatsPerBar); const numBars = Math.ceil(totalSteps / uiPadsToRender); updateSongDataAndHistory(() => Array(numBars || 1).fill(null).map((_, barIndex) => ({ id: barIndex, beats: Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex)) }))); toast.success(`${numBars} bars created for media duration.`); }; detectBpm(file); }, [mediaSrcUrl, detectBpm, bpm, uiPadsToRender, musicalBeatsPerBar, updateSongDataAndHistory]);
  const handleStartAnalysis = useCallback(() => { if (!loadedMediaFile || !videoPlayerRef.current) { toast.warn("Please load a video file."); return; } startAnalysis(videoPlayerRef.current, bpm, contextTimeSignature, captureResolution); }, [loadedMediaFile, startAnalysis, bpm, contextTimeSignature, captureResolution]);
  const coreHandleJointSelect = useCallback((jointAbbrev) => setActiveEditingJoint(prev => prev === jointAbbrev ? null : jointAbbrev), []);
  const handleJointDataUpdate = useCallback((jointAbbrev, dataType, value) => { updateSongDataAndHistory(d => { const beat = d[currentEditingBar].beats[activeBeatIndex]; if (!beat.jointInfo) beat.jointInfo = {}; if (!beat.jointInfo[jointAbbrev]) { beat.jointInfo[jointAbbrev] = {}; } beat.jointInfo[jointAbbrev][dataType] = value; return d; }); }, [currentEditingBar, activeBeatIndex, updateSongDataAndHistory]);
  const handleWheelControlChange = useCallback((side, newRotation) => { if (side === 'L') setLeftFootRotation(newRotation); else setRightFootRotation(newRotation); const ankle = side === 'L' ? 'LA' : 'RA'; updateSongDataAndHistory(d => { const beat = d[currentEditingBar].beats[activeBeatIndex]; if (!beat.jointInfo[ankle]) beat.jointInfo[ankle] = {}; beat.jointInfo[ankle].rotation = newRotation; return d; }); }, [currentEditingBar, activeBeatIndex, updateSongDataAndHistory]);
  const handleCrossfaderChange = useCallback((newValue) => { updateSongDataAndHistory(d => { const beat = d[currentEditingBar].beats[activeBeatIndex]; if (!beat.grounding) beat.grounding = { L: null, R: null, L_weight: 50 }; beat.grounding.L_weight = 100 - newValue; return d; }); }, [currentEditingBar, activeBeatIndex, updateSongDataAndHistory]);
  const coreHandleMainUIGroundingChange = useCallback((side, newGroundPoints) => { updateSongDataAndHistory(d => { const beat = d[currentEditingBar].beats[activeBeatIndex]; if (!beat.grounding) beat.grounding = { L: null, R: null, L_weight: 50 }; beat.grounding[side] = newGroundPoints; return d; }); }, [currentEditingBar, activeBeatIndex, updateSongDataAndHistory]);
  const coreHandleBeatClick = useCallback((barIdx, beatIdx) => { setCurrentEditingBar(barIdx); setActiveBeatIndex(beatIdx); }, []);
  const handleApplyTransition = useCallback(() => { if (transitionStartBeat >= transitionEndBeat) { toast.error("Start beat must be before end."); return; } updateSongDataAndHistory(d => { const bar = d[currentEditingBar].beats; const start = bar[transitionStartBeat].jointInfo; const end = bar[transitionEndBeat].jointInfo; const steps = transitionEndBeat - transitionStartBeat; const all = Array.from(new Set([...Object.keys(start), ...Object.keys(end)])); for (let i = 1; i < steps; i++) { const idx = transitionStartBeat + i; const frac = i / steps; const inter = {}; all.forEach(j => { const sj = start[j] || {}; const ej = end[j] || {}; const sv = sj.vector || {x:0,y:0,z:0}; const ev = ej.vector || {x:0,y:0,z:0}; const sr = sj.rotation || 0; const er = ej.rotation || 0; inter[j] = { ...sj, vector: lerpVector(sv, ev, frac), rotation: lerp(sr, er, frac), }; }); bar[idx].jointInfo = inter; } return d; }); toast.success(`Transition applied.`); }, [transitionStartBeat, transitionEndBeat, currentEditingBar, updateSongDataAndHistory]);
  const handleBpmChangeForInput = useCallback((e) => { coreHandleBpmChange(e.target.value); }, [coreHandleBpmChange]);
  const handleNavigateBeat = useCallback((direction) => { setActiveBeatIndex(prev => { const newIndex = prev + direction; if (newIndex < 0) return uiPadsToRender - 1; if (newIndex >= uiPadsToRender) return 0; return newIndex; }); }, [uiPadsToRender]);
  const handleNudgeJoint = useCallback((axis, delta) => { if (!activeEditingJoint) { toast.info("Select a joint to nudge its position."); return; } updateSongDataAndHistory(d => { const beat = d[currentEditingBar].beats[activeBeatIndex]; if (!beat.jointInfo) beat.jointInfo = {}; if (!beat.jointInfo[activeEditingJoint]) { beat.jointInfo[activeEditingJoint] = { vector: {x:0,y:0,z:0}, rotation: 0, extension: 0 }; } const nudgeAmount = 0.1; const currentVector = beat.jointInfo[activeEditingJoint].vector; const newValue = (currentVector[axis] || 0) + (delta * nudgeAmount); currentVector[axis] = Math.max(-1, Math.min(1, newValue)); return d; }); }, [activeEditingJoint, currentEditingBar, activeBeatIndex, updateSongDataAndHistory]);
  const coreHandlePlayPause = useCallback(() => { setIsPlaying(p => !p); }, []);
  const coreHandleStop = useCallback(() => { setIsPlaying(false); setCurrentBar(0); setCurrentStep(0); if (videoPlayerRef.current) { videoPlayerRef.current.pause(); videoPlayerRef.current.currentTime = 0; } }, []);
  const coreHandleTimeSignatureChange = useCallback((newTimeSignature) => { if (setTimeSignature) setTimeSignature(newTimeSignature); toast.info(`Time Signature set to ${newTimeSignature.beatsPerBar}/${newTimeSignature.beatUnit}.`); }, [setTimeSignature]);
  const coreHandleAddSoundToBeat = useCallback((barIdx, beatIdx, soundName) => { updateSongDataAndHistory(d => { const beat = d[barIdx].beats[beatIdx]; const sounds = beat.sounds || []; if (!sounds.includes(soundName) && sounds.length < MAX_SOUNDS_PER_BEAT) { beat.sounds = [...sounds, soundName]; } return d; }); }, [updateSongDataAndHistory]);
  const coreHandleDeleteSound = useCallback((barIdx, beatIdx, soundName) => { updateSongDataAndHistory(d => { const beat = d[barIdx].beats[beatIdx]; if(beat.sounds) { beat.sounds = beat.sounds.filter(s => s !== soundName); } return d; }); }, [updateSongDataAndHistory]);
  const coreHandleClearPoseData = useCallback((barIdx, beatIdx) => { updateSongDataAndHistory(d => { const beat = d[barIdx].beats[beatIdx]; beat.jointInfo = {}; beat.grounding = { L: null, R: null, L_weight: 50 }; beat.thumbnail = null; return d; }); toast.info(`Pose cleared.`); }, [updateSongDataAndHistory]);
  const coreHandleTapTempo = useCallback(() => { const now = performance.now(); const currentTaps = tapTempoDataRef.current.timestamps; if (tapTempoDataRef.current.timer) clearTimeout(tapTempoDataRef.current.timer); currentTaps.push(now); tapTempoDataRef.current.timer = setTimeout(() => { const ts = tapTempoDataRef.current.timestamps; if (ts.length >= TAP_TEMPO_MIN_TAPS) { let intervals = []; for (let i = 1; i < ts.length; i++) intervals.push(ts[i] - ts[i-1]); if (intervals.length > 2) { const sorted = [...intervals].sort((a,b) => a-b); const median = sorted[Math.floor(sorted.length / 2)]; intervals = intervals.filter(int => int < median * 2.5 && int > median * 0.4); } if (intervals.length >= TAP_TEMPO_MIN_TAPS - 1) { const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length; if (avgInterval > 50 && avgInterval < TAP_TEMPO_MAX_INTERVAL_MS) { const newBPM = Math.round(60000 / avgInterval); coreHandleBpmChange(String(newBPM)); toast.info(`Tempo updated to: ~${newBPM} BPM`); } else { toast.warn("Tap tempo intervals too erratic or out of range."); } } else { toast.warn(`Not enough consistent taps (Need ${TAP_TEMPO_MIN_TAPS}).`); } } else if (ts.length > 0) { toast.info(`Tap at least ${TAP_TEMPO_MIN_TAPS} times.`); } tapTempoDataRef.current.timestamps = []; tapTempoDataRef.current.timer = null; }, TAP_TEMPO_MAX_INTERVAL_MS); if (currentTaps.length > TAP_TEMPO_MIN_TAPS + 10) tapTempoDataRef.current.timestamps = currentTaps.slice(-(TAP_TEMPO_MIN_TAPS + 5)); }, [coreHandleBpmChange]);
  const coreHandleNavigateEditingBar = useCallback((direction) => { setCurrentEditingBar(prevBar => { const newBar = (prevBar + direction + totalBarsInSequence) % totalBarsInSequence; setActiveBeatIndex(0); return newBar; }); }, [totalBarsInSequence]);
  const coreHandleAddBar = useCallback(() => { updateSongDataAndHistory(d => { const newBarId = d.length; d.push({ id: newBarId, beats: Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i)) }); setCurrentEditingBar(newBarId); setActiveBeatIndex(0); return d; }); toast.success("New bar added."); }, [uiPadsToRender, updateSongDataAndHistory]);
  const coreHandleClearBar = useCallback(() => { updateSongDataAndHistory(d => { if (d[currentEditingBar]) { d[currentEditingBar].beats = Array(uiPadsToRender).fill(null).map((_, i) => createDefaultBeatObject(i)); } return d; }); setActiveBeatIndex(0); toast.info(`Bar ${currentEditingBar + 1} cleared.`); }, [currentEditingBar, uiPadsToRender, updateSongDataAndHistory]);
  const coreHandleRemoveBar = useCallback(() => { if (totalBarsInSequence <= 1) { coreHandleClearBar(); toast.warn("Last bar cannot be removed. Cleared instead."); return; } updateSongDataAndHistory(d => { const newData = d.slice(0, -1); if (currentEditingBar >= newData.length) { setCurrentEditingBar(Math.max(0, newData.length - 1)); setActiveBeatIndex(0); } return newData; }); toast.success(`Last bar removed.`); }, [totalBarsInSequence, currentEditingBar, updateSongDataAndHistory, coreHandleClearBar]);
  const coreHandleToggleLoop = useCallback(() => { const newIsLooping = !isLoopingRef.current; setIsLooping(newIsLooping); if (!newIsLooping) { setLoopStartPoint(null); setLoopEndPoint(null); toast.info("Looping OFF."); } else { if (!loopStartPointRef.current || !loopEndPointRef.current) { const barForDefaultLoop = currentEditingBar; setLoopStartPoint({ bar: barForDefaultLoop, beat: 0 }); setLoopEndPoint({ bar: barForDefaultLoop, beat: uiPadsToRender - 1 }); toast.success(`Looping ON for Bar ${barForDefaultLoop + 1}.`); } else { toast.success("Looping ON."); } } }, [currentEditingBar, uiPadsToRender, songDataRef]);
  const coreHandleSetLoopPoint = useCallback((type) => { const barToSet = isPlayingRef.current ? currentBarRef.current : currentEditingBar; const beatToSet = isPlayingRef.current ? currentStepRef.current : (activeBeatIndex ?? 0); const pointToSet = { bar: barToSet, beat: beatToSet }; if (type === 'start') { setLoopStartPoint(pointToSet); if (!loopEndPointRef.current || pointToSet.bar > loopEndPointRef.current.bar || (pointToSet.bar === loopEndPointRef.current.bar && pointToSet.beat > loopEndPointRef.current.beat)) { const beatsInBar = songDataRef.current[pointToSet.bar]?.beats.length || uiPadsToRender; setLoopEndPoint({ bar: pointToSet.bar, beat: Math.max(pointToSet.beat, beatsInBar - 1) }); toast.info(`Loop Start set.`); } else { toast.info(`Loop Start set.`); } } else { setLoopEndPoint(pointToSet); if (!loopStartPointRef.current || pointToSet.bar < loopStartPointRef.current.bar || (pointToSet.bar === loopStartPointRef.current.bar && pointToSet.beat < loopStartPointRef.current.beat)) { setLoopStartPoint({ bar: pointToSet.bar, beat: 0 }); toast.info(`Loop End set.`); } else { toast.info(`Loop End set.`); } } if (!isLoopingRef.current) setIsLooping(true); }, [currentEditingBar, activeBeatIndex, uiPadsToRender, songDataRef]);
  const coreHandleCopyBar = useCallback(() => { const barToCopy = songDataRef.current[currentEditingBar]?.beats; if (barToCopy) { setCopiedBarData(makeDeepCopy(barToCopy)); toast.success(`Bar ${currentEditingBar + 1} copied.`); } }, [currentEditingBar, makeDeepCopy]);
  const coreHandlePasteBar = useCallback(() => { if (!copiedBarData) { toast.warn("No bar data to paste."); return; } updateSongDataAndHistory(d => { if (d[currentEditingBar]) { d[currentEditingBar].beats = makeDeepCopy(copiedBarData); } return d; }); toast.success(`Pasted to Bar ${currentEditingBar + 1}.`); }, [currentEditingBar, copiedBarData, makeDeepCopy, updateSongDataAndHistory]);
  const coreHandleCopyPoseData = useCallback(() => { const beatToCopy = songDataRef.current[currentEditingBar]?.beats[activeBeatIndex]; if (beatToCopy) { setCopiedPoseData({ jointInfo: makeDeepCopy(beatToCopy.jointInfo || {}), grounding: makeDeepCopy(beatToCopy.grounding || { L: null, R: null, L_weight: 50 }), }); toast.success(`Pose from B${currentEditingBar + 1}:S${activeBeatIndex + 1} copied.`); } }, [currentEditingBar, activeBeatIndex, makeDeepCopy]);
  const coreHandlePastePoseData = useCallback(() => { if (!copiedPoseData) { toast.warn("No pose data to paste."); return; } updateSongDataAndHistory(d => { const targetBeat = d[currentEditingBar]?.beats[activeBeatIndex]; if (targetBeat) { targetBeat.jointInfo = makeDeepCopy(copiedPoseData.jointInfo); targetBeat.grounding = makeDeepCopy(copiedPoseData.grounding); } return d; }); toast.success(`Pose pasted.`); }, [currentEditingBar, activeBeatIndex, copiedPoseData, makeDeepCopy, updateSongDataAndHistory]);
  const coreHandleSkip = useCallback((direction) => { const wasPlaying = isPlayingRef.current; if (wasPlaying) setIsPlaying(false); let numStepsToSkip; if (skipIntervalDenominator === 1) { numStepsToSkip = direction > 0 ? (uiPadsToRender - currentStepRef.current) || uiPadsToRender : currentStepRef.current + 1; if (currentStepRef.current === 0 && direction < 0) numStepsToSkip = uiPadsToRender; } else { numStepsToSkip = uiPadsToRender / skipIntervalDenominator; } let totalCurrentStep = (currentBarRef.current * uiPadsToRender) + currentStepRef.current; let totalNewStep = totalCurrentStep + (direction * numStepsToSkip); const totalSequenceSteps = totalBarsInSequence * uiPadsToRender; totalNewStep = (totalNewStep + totalSequenceSteps) % totalSequenceSteps; const newBar = Math.floor(totalNewStep / uiPadsToRender); const newStep = totalNewStep % uiPadsToRender; setCurrentBar(newBar); setCurrentStep(newStep); setCurrentEditingBar(newBar); setActiveBeatIndex(newStep); if (videoPlayerRef.current) { const timePerStep = (60 / bpmRef.current) / (uiPadsToRender / musicalBeatsPerBar); const newTime = (newBar * uiPadsToRender + newStep) * timePerStep; if (isFinite(newTime) && newTime <= videoPlayerRef.current.duration) videoPlayerRef.current.currentTime = newTime; } if (wasPlaying) setTimeout(() => setIsPlaying(true), 50); }, [skipIntervalDenominator, uiPadsToRender, totalBarsInSequence, musicalBeatsPerBar]);
  const coreHandleSkipIntervalChange = useCallback((value) => { setSkipIntervalDenominator(parseInt(value, 10)); }, []);
  const coreHandleMediaOriginalBPMChange = useCallback((newBpmVal) => { setMediaOriginalBPM(newBpmVal); }, []);
  const coreHandleDetectMediaBPM = useCallback(async () => { toast.info("BPM Detection is a planned feature."); }, []);
  const coreHandleSetDetectedBPMAsMaster = useCallback(() => { const parsedMediaBPM = parseFloat(mediaOriginalBPM); if (mediaOriginalBPM && !isNaN(parsedMediaBPM) && parsedMediaBPM >= BPM_MIN && parsedMediaBPM <= BPM_MAX) { coreHandleBpmChange(String(Math.round(parsedMediaBPM))); toast.success(`Master BPM set to Media BPM: ${Math.round(parsedMediaBPM)}`); } else { toast.warn("No valid Media BPM to set as master."); } }, [mediaOriginalBPM, coreHandleBpmChange]);
  const coreHandleModeChange = useCallback((newMode) => { setViewMode(newMode); }, []);
  const coreHandleKitSelect = useCallback((kitName) => { setSelectedKitName(kitName); }, []);
  const coreHandleSoundSelectedInBank = useCallback((soundName) => { setCurrentSoundInBank(soundName); }, []);
  const coreHandleToggleShift = useCallback(() => { setIsShiftActive(prev => !prev); }, []);
  const midiHandlers = useMemo(() => ({ onControlChange: (cc, val) => { if (cc === 7) handleCrossfaderChange(100 - (val / 127) * 100); if (cc === 10) setCurveKnobValue((val / 127) * 100); }, onNoteOn: (note) => { const pad = note - 36; if (pad >= 0 && pad < uiPadsToRender) coreHandleBeatClick(currentEditingBar, pad); } }), [uiPadsToRender, currentEditingBar, handleCrossfaderChange, coreHandleBeatClick, setCurveKnobValue]);
  useWebMidi(midiHandlers);
  const wrappedPlaybackHandlers = useMemo(() => ({ onUndo: handleUndo, onRedo: handleRedo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1, onPlayPause: coreHandlePlayPause, isPlaying: isPlaying, onStop: coreHandleStop, onTapTempo: coreHandleTapTempo, onNextBar: () => coreHandleNavigateEditingBar(1), onPrevBar: () => coreHandleNavigateEditingBar(-1), onAddBar: coreHandleAddBar, onRemoveBar: coreHandleRemoveBar, onClearBar: coreHandleClearBar, onToggleLoop: coreHandleToggleLoop, onSetLoopStart: () => coreHandleSetLoopPoint('start'), onSetLoopEnd: () => coreHandleSetLoopPoint('end'), onCopyBar: coreHandleCopyBar, onPasteBar: coreHandlePasteBar, canPaste: !!copiedBarData, onCopyPose: coreHandleCopyPoseData, onPastePose: coreHandlePastePoseData, canPastePose: !!copiedPoseData, onSkipForward: () => coreHandleSkip(1), onSkipBackward: () => coreHandleSkip(-1), onDetectMediaBPM: coreHandleDetectMediaBPM, onSetDetectedBPMAsMaster: coreHandleSetDetectedBPMAsMaster, onTimeSignatureChange: coreHandleTimeSignatureChange, onMediaOriginalBPMChange: coreHandleMediaOriginalBPMChange, onSkipIntervalChange: coreHandleSkipIntervalChange, onToggleShift: coreHandleToggleShift, onBpmChange: handleBpmChangeForInput, }), [handleUndo, handleRedo, historyIndex, history.length, coreHandlePlayPause, isPlaying, coreHandleStop, coreHandleTapTempo, coreHandleNavigateEditingBar, coreHandleAddBar, coreHandleRemoveBar, coreHandleClearBar, coreHandleToggleLoop, coreHandleSetLoopPoint, coreHandleCopyBar, coreHandlePasteBar, copiedBarData, coreHandleCopyPoseData, coreHandlePastePoseData, copiedPoseData, coreHandleSkip, coreHandleDetectMediaBPM, coreHandleSetDetectedBPMAsMaster, coreHandleTimeSignatureChange, coreHandleMediaOriginalBPMChange, coreHandleSkipIntervalChange, coreHandleToggleShift, handleBpmChangeForInput]);

  // --- USEEFFECT HOOKS ---
  useEffect(() => { if (detectedBpm && bpm !== detectedBpm) { coreHandleBpmChange(String(detectedBpm)); } }, [detectedBpm, bpm, coreHandleBpmChange]);
  useEffect(() => { const videoElement = videoPlayerRef.current; if (isPlaying && mediaSrcUrl && videoElement) { startLiveTracking(videoElement); } else { stopLiveTracking(); setLivePoseData(null); } return () => stopLiveTracking(); }, [isPlaying, mediaSrcUrl, startLiveTracking, stopLiveTracking]);
  useEffect(() => { if (mediaSrcUrl && videoPlayerRef.current) { const videoElement = videoPlayerRef.current; const handleTimeUpdate = () => { const currentTime = videoElement.currentTime; setMainTimecodeParts({ mm: String(Math.floor(currentTime / 60)).padStart(2, '0'), ss: String(Math.floor(currentTime % 60)).padStart(2, '0'), cs: String(Math.floor((currentTime * 100) % 100)).padStart(2, '0'), }); if (!isPlayingRef.current) return; const timePerStep = (60 / bpmRef.current) / (uiPadsToRender / musicalBeatsPerBar); if(timePerStep <= 0 || !isFinite(timePerStep)) return; const totalStepsElapsed = Math.floor(currentTime / timePerStep); const newBar = Math.floor(totalStepsElapsed / uiPadsToRender); const newStep = totalStepsElapsed % uiPadsToRender; if (newBar < totalBarsInSequence && (newBar !== currentBarRef.current || newStep !== currentStepRef.current)) { setCurrentBar(newBar); setCurrentStep(newStep); const sounds = songDataRef.current[newBar]?.beats[newStep]?.sounds || []; sounds.forEach(soundKey => { const soundObj = currentSelectedKitObject.sounds.find(s => s.name === soundKey); if(soundObj?.url) audioManager.playSound(soundObj.url); }); } }; const handleVideoEnded = () => { if (isLoopingRef.current) { const start = loopStartPointRef.current || { bar: 0, beat: 0 }; const timePerStep = (60 / bpmRef.current) / (uiPadsToRender / musicalBeatsPerBar); const loopStartTime = (start.bar * uiPadsToRender + start.beat) * timePerStep; videoElement.currentTime = loopStartTime; videoElement.play(); } else { setIsPlaying(false); } }; const handleDurationChange = () => { setMediaDuration(videoElement.duration); }; videoElement.addEventListener('timeupdate', handleTimeUpdate); videoElement.addEventListener('ended', handleVideoEnded); videoElement.addEventListener('durationchange', handleDurationChange); return () => { videoElement.removeEventListener('timeupdate', handleTimeUpdate); videoElement.removeEventListener('ended', handleVideoEnded); videoElement.removeEventListener('durationchange', handleDurationChange); }; } else { const shouldRunInterval = isPlaying && !isLoadingSounds; if (shouldRunInterval) { const timePerStep = (60000 / bpm) / (uiPadsToRender / musicalBeatsPerBar); if (timePerStep > 0 && isFinite(timePerStep)) { intervalRef.current = setInterval(() => { if (!isPlayingRef.current) { clearInterval(intervalRef.current); return; } const sounds = songDataRef.current[currentBarRef.current]?.beats[currentStepRef.current]?.sounds || []; sounds.forEach(soundKey => { const soundObj = currentSelectedKitObject.sounds.find(s => s.name === soundKey); if(soundObj?.url) audioManager.playSound(soundObj.url); }); let nextStep = currentStepRef.current + 1; let nextBar = currentBarRef.current; if (nextStep >= uiPadsToRender) { nextStep = 0; nextBar = nextBar + 1; if (isLoopingRef.current) { const end = loopEndPointRef.current || { bar: totalBarsInSequence - 1, beat: uiPadsToRender - 1 }; const start = loopStartPointRef.current || { bar: 0, beat: 0 }; if (currentBarRef.current >= end.bar && currentStepRef.current >= end.beat) { nextBar = start.bar; nextStep = start.beat; } else if (nextBar >= totalBarsInSequence) { nextBar = start.bar; } } else if (nextBar >= totalBarsInSequence) { setIsPlaying(false); nextBar = 0; nextStep = 0; } } setCurrentBar(nextBar); setCurrentStep(nextStep); }, timePerStep); } } return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; } }, [isPlaying, mediaSrcUrl, isLoadingSounds, bpm, musicalBeatsPerBar, uiPadsToRender, currentSelectedKitObject, totalBarsInSequence, isLooping, loopStartPoint, loopEndPoint]);
  useEffect(() => { const resumeAudioContext = async () => { await audioManager.resumeAudioContext(); }; if (typeof window !== 'undefined' && audioManager.getAudioContext && audioManager.getAudioContext().state === 'suspended') { window.addEventListener('click', resumeAudioContext, { once: true }); window.addEventListener('touchstart', resumeAudioContext, { once: true }); } return () => { window.removeEventListener('click', resumeAudioContext); window.removeEventListener('touchstart', resumeAudioContext); } }, []);
  useEffect(() => { setIsLoadingSounds(true); setErrorLoadingSounds(null); if (currentSelectedKitObject && currentSelectedKitObject.sounds) { audioManager.preloadSounds(currentSelectedKitObject.sounds).then(() => setIsLoadingSounds(false)).catch(err => { setIsLoadingSounds(false); setErrorLoadingSounds(err.message); toast.error("Failed to load sound kit."); }); } else { setIsLoadingSounds(false); logDebug('warn', 'No valid sound kit selected to preload.'); } }, [currentSelectedKitObject]);
  useEffect(() => { const handleKeyDown = (e) => { const targetTagName = e.target?.tagName?.toUpperCase(); if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTagName)) return; const key = e.key; const keyLower = key.toLowerCase(); const isCtrlOrMeta = e.ctrlKey || e.metaKey; if (isCtrlOrMeta) { if (keyLower === 'z') { e.preventDefault(); e.shiftKey ? handleRedo() : handleUndo(); return; } if (keyLower === 'y') { e.preventDefault(); handleRedo(); return; } } if (key === 'Escape' && activeEditingJoint) { setActiveEditingJoint(null); e.preventDefault(); return; } const beatIndexFromKey = KEYBOARD_LAYOUT_MODE_SEQ[keyLower]; if (beatIndexFromKey !== undefined && beatIndexFromKey < uiPadsToRender) { e.preventDefault(); setActiveBeatIndex(beatIndexFromKey); const soundsOnPad = songDataRef.current[currentEditingBar]?.beats[beatIndexFromKey]?.sounds || []; soundsOnPad.forEach(soundKey => { const soundObj = currentSelectedKitObject.sounds.find(s => s.name === soundKey); if (soundObj?.url) audioManager.playSound(soundObj.url); }); return; } if (KEYBOARD_TRANSPORT_CONTROLS[key]) { e.preventDefault(); if (KEYBOARD_TRANSPORT_CONTROLS[key] === 'playPause') coreHandlePlayPause(); if (KEYBOARD_TRANSPORT_CONTROLS[key] === 'stop') coreHandleStop(); return; } if (KEYBOARD_MODE_SWITCH[keyLower]) { e.preventDefault(); setViewMode(KEYBOARD_MODE_SWITCH[keyLower]); return; } if (viewMode === MODES.POS) { if (KEYBOARD_NAVIGATION_POS_MODE[key]) { e.preventDefault(); if (KEYBOARD_NAVIGATION_POS_MODE[key] === 'prevBeat') handleNavigateBeat(-1); if (KEYBOARD_NAVIGATION_POS_MODE[key] === 'nextBeat') handleNavigateBeat(1); return; } if (KEYBOARD_FOOT_GROUNDING[keyLower]) { e.preventDefault(); const { side, points } = KEYBOARD_FOOT_GROUNDING[keyLower]; coreHandleMainUIGroundingChange(side, points); return; } if (KEYBOARD_JOINT_NUDGE_CONTROLS[keyLower]) { e.preventDefault(); const { axis, delta } = KEYBOARD_JOINT_NUDGE_CONTROLS[keyLower]; handleNudgeJoint(axis, delta); return; } } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [handleUndo, handleRedo, activeEditingJoint, viewMode, handleNavigateBeat, handleNudgeJoint, coreHandleMainUIGroundingChange, coreHandlePlayPause, coreHandleStop, currentEditingBar, uiPadsToRender, currentSelectedKitObject]);
  useEffect(() => { const absoluteBeatIndex = (isPlaying ? currentBar : currentEditingBar) * uiPadsToRender + (isPlaying ? currentStep : activeBeatIndex); const timecode = beatTimecodes[absoluteBeatIndex] || { mm: '00', ss: '00', cs: '00' }; const beatDataToNotate = isPlaying ? { jointInfo: livePoseData } : beatDataForActiveSelection; const newNotation = generateNotationForBeat(isPlaying ? currentBar : currentEditingBar, isPlaying ? currentStep : activeBeatIndex, beatDataToNotate, timecode); setNotationText(newNotation); }, [isPlaying, livePoseData, beatDataForActiveSelection, currentBar, currentStep, currentEditingBar, activeBeatIndex, beatTimecodes, uiPadsToRender]);
  useEffect(() => { const url = mediaSrcUrl; return () => { if (url) URL.revokeObjectURL(url); }; }, [mediaSrcUrl]);
  useEffect(() => { if (contextBpm !== undefined && bpm !== contextBpm) setBpm(contextBpm); }, [contextBpm, bpm]);

  // --- RENDER LOGIC ---
  const rawCrossfaderValue = beatDataForActiveSelection?.grounding?.L_weight ?? 50;
  const curvedCrossfaderValue = calculateCurvedValue(rawCrossfaderValue, curveKnobValue);
  const poseToDisplay = isPlaying && livePoseData ? livePoseData : activePoseData?.jointInfo;

  if (isLoadingSounds) return <div className="flex items-center justify-center h-full bg-gray-900 text-white">Loading...</div>;
  if (errorLoadingSounds) return <div className="flex items-center justify-center h-full bg-gray-900 text-red-500">Error loading sounds.</div>;
  
  return (
    <div className="p-2 sm:p-3 bg-gray-900 text-gray-100 h-screen flex flex-col font-sans select-none">
      <div className="w-full max-w-full 2xl:max-w-screen-3xl mx-auto flex flex-col h-full overflow-hidden">
        {/* ======================================================================================= */}
        {/* TOP HEADER SECTION                                                                    */}
        {/* ======================================================================================= */}
        <header className="mb-2 p-2 bg-gray-800 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-x-4 gap-y-2 flex-shrink-0 z-30">
          <div className="flex items-center gap-2 flex-wrap">
            <LoadSave onSave={handleSaveSequence} onLoad={handleLoadSequence} onFileSelected={handleMediaFileSelected} />
            {isDetectingBpm && <div className="text-xs text-purple-400 animate-pulse font-semibold">Detecting BPM...</div>}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-700/50 rounded-md">
                <Button onClick={() => setCaptureResolution(16)} size="sm" variant={captureResolution === 16 ? 'primary' : 'secondary'} className="!rounded-r-none">1/16</Button>
                <Button onClick={() => setCaptureResolution(8)} size="sm" variant={captureResolution === 8 ? 'primary' : 'secondary'} className="!rounded-none !border-x-0">1/8</Button>
                <Button onClick={() => setCaptureResolution(4)} size="sm" variant={captureResolution === 4 ? 'primary' : 'secondary'} className="!rounded-l-none">1/4</Button>
            </div>
            <Button onClick={handleStartAnalysis} variant="primary" size="sm" disabled={!mediaSrcUrl || isAnalyzing} iconLeft={isAnalyzing ? faSpinner : faMicrochip} iconProps={isAnalyzing ? { spin: true } : {}}>{isAnalyzing ? `Analyzing... ${analysisProgress.toFixed(0)}%` : "Analyze"}</Button>
            {isAnalyzing && <Button onClick={cancelAnalysis} variant="danger" size="xs" iconLeft={faTimes} />}
          </div>

          <div className="flex items-center gap-4">
            <SoundBank soundKits={soundKitsObject} selectedKitName={selectedKitName} onKitSelect={setSelectedKitName} currentSoundInKit={currentSoundInBank} onSoundInKitSelect={setCurrentSoundInBank} />
            <div className="flex items-center gap-1">
              <Button onClick={() => setViewMode(MODES.POS)} variant={viewMode === MODES.POS ? "custom" : "secondary"} className={`!px-3 h-8 ${viewMode === MODES.POS && '!bg-pos-yellow !text-black font-semibold'}`}>POS</Button>
              <Button onClick={() => setViewMode(MODES.SEQ)} variant={viewMode === MODES.SEQ ? "custom" : "secondary"} className={`!px-3 h-8 ${viewMode === MODES.SEQ && '!bg-brand-seq !text-white font-semibold'}`}>SEQ</Button>
            </div>
          </div>
        </header>

        {/* ======================================================================================= */}
        {/* TRANSPORT CONTROLS SECTION                                                            */}
        {/* ======================================================================================= */}
        <section aria-label="Transport Controls" className="mb-2 flex-shrink-0 z-20">
          <PlaybackControls {...wrappedPlaybackHandlers} />
        </section>

        {/* ======================================================================================= */}
        {/* MAIN LAYOUT GRID                                                                      */}
        {/* ======================================================================================= */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-4 overflow-hidden min-h-0">
          
          <aside className="order-1 flex flex-col items-center gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
            <SideJointSelector side="L" onJointSelect={coreHandleJointSelect} activeEditingJoint={activeEditingJoint} />
            {activeEditingJoint && UI_LEFT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && (
              <JointInputPanel jointAbbrev={activeEditingJoint} jointData={activePoseData?.jointInfo?.[activeEditingJoint]} onClose={() => setActiveEditingJoint(null)} onUpdate={handleJointDataUpdate} />
            )}
          </aside>

          <div ref={centralColumnRef} className="order-2 flex flex-col items-center justify-start gap-2 overflow-hidden">
            <section aria-label="Beat Sequencer Grid" className="w-full">
              <div className="w-full bg-gray-800/30 p-2 rounded-lg flex flex-col items-center justify-center">
                <div className="grid grid-cols-8 gap-1.5 mb-1.5 w-full">
                  {currentBarBeatsForUI.slice(0, 8).map((beat, beatIdx) => ( <BeatButton key={`beat-A-${beatIdx}`} {...{ barIndex: currentEditingBar, beatIndex: beatIdx, isActive: activeBeatIndex === beatIdx, isCurrentStep: isPlaying && currentBar === currentEditingBar && currentStep === beatIdx, onClick: coreHandleBeatClick, sounds: beat?.sounds, viewMode, hasPoseData: !!beat?.jointInfo && Object.keys(beat.jointInfo).length > 0, thumbnail: beat?.thumbnail, onClearPoseData: coreHandleClearPoseData, currentSoundInBank, onAddSound: coreHandleAddSoundToBeat, onDeleteSound: coreHandleDeleteSound }}/> ))}
                </div>
                <div className="grid grid-cols-8 gap-1.5 w-full">
                  {currentBarBeatsForUI.slice(8, 16).map((beat, beatIdx) => ( <BeatButton key={`beat-B-${beatIdx}`} {...{ barIndex: currentEditingBar, beatIndex: beatIdx + 8, isActive: activeBeatIndex === beatIdx + 8, isCurrentStep: isPlaying && currentBar === currentEditingBar && currentStep === beatIdx + 8, onClick: coreHandleBeatClick, sounds: beat?.sounds, viewMode, hasPoseData: !!beat?.jointInfo && Object.keys(beat.jointInfo).length > 0, thumbnail: beat?.thumbnail, onClearPoseData: coreHandleClearPoseData, currentSoundInBank, onAddSound: coreHandleAddSoundToBeat, onDeleteSound: coreHandleDeleteSound }}/> ))}
                </div>
              </div>
            </section>
            
            <section aria-label="Notation Display" className="w-full bg-gray-800/60 rounded-md text-sm space-y-1 flex-shrink-0 p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <div> <h4 className="font-bold text-pos-yellow mb-1 uppercase tracking-wider text-xs"> Shorthand: <span className="text-xs text-gray-400 font-normal normal-case ml-2">(B{isPlaying ? currentBar + 1 : currentEditingBar + 1}:S{isPlaying ? currentStep + 1 : activeBeatIndex + 1})</span> </h4> <pre className="text-white font-mono bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto whitespace-pre-wrap break-all text-xs">{notationText.shorthand}</pre> </div>
                <div> <h4 className="font-bold text-gray-300 mb-1 uppercase tracking-wider text-xs">Plain Eng:</h4> <p className="text-gray-200 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs">{notationText.plainEnglish}</p> </div>
                <div> <h4 className="font-bold text-gray-400 mb-1 uppercase tracking-wider text-xs">Analysis:</h4> <p className="text-gray-300 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs">{notationText.analysis}</p> </div>
              </div>
            </section>

            <section aria-label="Main Visualizers and Controls" className="w-full flex-grow relative flex flex-col items-center justify-around overflow-hidden p-4">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 w-full h-full">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <FootDisplay side="L" groundPoints={mainLeftGrounding} rotation={leftFootRotation} onRotate={handleWheelControlChange} onGroundingChange={coreHandleMainUIGroundingChange} sizeClasses="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square" />
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative w-full max-w-md aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center">
                            {mediaSrcUrl ? (
                                <>
                                    <VideoMediaPlayer ref={videoPlayerRef} mediaSrc={mediaSrcUrl} />
                                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showSkeletonOverlay ? 'opacity-70' : 'opacity-0'}`}>
                                        <SkeletalPoseVisualizer2D onJointClick={coreHandleJointSelect} jointInfoData={poseToDisplay || {}} highlightJoint={activeEditingJoint}/>
                                    </div>
                                    <Button onClick={() => setShowSkeletonOverlay(s => !s)} variant="icon" className="absolute top-2 right-2 z-10 !bg-black/50 hover:!bg-black/80" title="Toggle Skeleton Overlay">
                                        <FontAwesomeIcon icon={showSkeletonOverlay ? 'eye' : 'eye-slash'} />
                                    </Button>
                                </>
                            ) : (
                                <SkeletalPoseVisualizer2D onJointClick={coreHandleJointSelect} jointInfoData={poseToDisplay || {}} highlightJoint={activeEditingJoint}/>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <HipWeightIndicator side="L" weight={beatDataForActiveSelection?.grounding?.L_weight} />
                            <Crossfader value={100 - curvedCrossfaderValue} onChange={handleCrossfaderChange} className="w-64 h-4"/>
                            <HipWeightIndicator side="R" weight={beatDataForActiveSelection?.grounding?.L_weight} />
                        </div>
                        <RotationKnob value={curveKnobValue} onChange={setCurveKnobValue} size={48} label="Curve" />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                         <FootDisplay side="R" groundPoints={mainRightGrounding} rotation={rightFootRotation} onRotate={handleWheelControlChange} onGroundingChange={coreHandleMainUIGroundingChange} sizeClasses="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square" />
                    </div>
                </div>
                <div className="mt-4">
                    <TransitionEditor startBeat={transitionStartBeat} endBeat={transitionEndBeat} onStartBeatChange={setTransitionStartBeat} onEndBeatChange={setTransitionEndBeat} onApplyTransition={handleApplyTransition} maxBeat={uiPadsToRender} />
                </div>
            </section>
          </div>
          
          <aside className="order-3 flex flex-col items-center gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
             <SideJointSelector side="R" onJointSelect={coreHandleJointSelect} activeEditingJoint={activeEditingJoint} />
             {activeEditingJoint && UI_RIGHT_JOINTS_ABBREVS_NEW.some(j => j.abbrev === activeEditingJoint) && ( <JointInputPanel jointAbbrev={activeEditingJoint} jointData={activePoseData?.jointInfo?.[activeEditingJoint]} onClose={() => setActiveEditingJoint(null)} onUpdate={handleJointDataUpdate} /> )}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default StepSequencerControls;