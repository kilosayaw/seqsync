import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { produce } from 'immer';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import { DEFAULT_BPM, DEFAULT_TIME_SIGNATURE, UI_PADS_PER_BAR, TAP_TEMPO_MIN_TAPS, TAP_TEMPO_MAX_INTERVAL_MS } from '../utils/constants';


const SequenceContext = createContext(null);

const createDefaultBeatObject = (barIndex, beatIndex) => ({
    id: `${barIndex}-${beatIndex}`,
    sounds: [], jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 },
    transition: { poseCurve: 'LINEAR', soundCurve: 'LINEAR' },
    thumbnail: null, videoThumbnail: null, waveform: null, onsetTimestamp: null,
});

const generateInitialSongData = (bars = 2) => {
    return Array.from({ length: bars }, (_, barIndex) => ({
        id: `bar-${Date.now()}-${barIndex}`,
        beats: Array.from({ length: UI_PADS_PER_BAR }, (_, beatIndex) => createDefaultBeatObject(barIndex, beatIndex)),
    }));
};

const initialSongData = generateInitialSongData(2);
const initialSnapshot = { songData: initialSongData, bpm: DEFAULT_BPM, timeSignature: DEFAULT_TIME_SIGNATURE };

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(initialSnapshot.songData);
    const [bpm, setBpmState] = useState(initialSnapshot.bpm);
    const [timeSignature, setTimeSignature] = useState(initialSnapshot.timeSignature);
    
    // --- DEFINITIVE FIX: Revert `history` to use `useState` for proper lifecycle updates ---
    const [history, setHistory] = useState([initialSnapshot]);
    const historyIndex = useRef(0);

    const [version, setVersion] = useState(0);
    const [copiedBarData, setCopiedBarData] = useState(null);
    const [copiedPoseData, setCopiedPoseData] = useState(null);
    const tapTempoTimestamps = useRef([]);

    const updateStateAndHistory = useCallback((producer, actionName) => {
        const nextState = produce(songData, producer);
        const currentStateSnapshot = { songData: nextState, bpm, timeSignature };
        
        setHistory(prevHistory => {
            const newHistory = prevHistory.slice(0, historyIndex.current + 1);
            newHistory.push(currentStateSnapshot);
            historyIndex.current = newHistory.length - 1;
            return newHistory;
        });

        setSongData(nextState);
        setVersion(v => v + 1);
    }, [songData, bpm, timeSignature]);
    
    const setBpm = useCallback((newBpm) => {
        const validatedBpm = Math.max(30, Math.min(300, newBpm || DEFAULT_BPM));
        setBpmState(validatedBpm);
    }, []);


    const handleTapTempo = useCallback(() => {
        const now = Date.now();
        const timestamps = tapTempoTimestamps.current;
        
        if (timestamps.length > 0 && (now - timestamps[timestamps.length - 1] > TAP_TEMPO_MAX_INTERVAL_MS)) {
            timestamps.length = 0; // Reset if the last tap was too long ago
        }

        timestamps.push(now);
        if (timestamps.length > TAP_TEMPO_MIN_TAPS) {
            timestamps.shift(); // Keep only the last few taps
        }

        if (timestamps.length >= 2) {
            const intervals = [];
            for (let i = 1; i < timestamps.length; i++) {
                intervals.push(timestamps[i] - timestamps[i - 1]);
            }
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            if (averageInterval > 0) {
                const newBpm = Math.round(60000 / averageInterval);
                setBpm(newBpm);
                toast.info(`BPM set to ~${newBpm}`);
            }
        }
    }, [setBpm]);


    
    // --- UNDO/REDO ---
    const handleUndo = useCallback(() => {
        if (historyIndex.current > 0) {
            historyIndex.current--;
            const previousState = history[historyIndex.current];
            setSongData(previousState.songData);
            setBpm(previousState.bpm);
            setTimeSignature(previousState.timeSignature);
            setVersion(v => v + 1);
            toast.info("Undo");
        }
    }, [history, setBpm]);

    const handleRedo = useCallback(() => {
        if (historyIndex.current < history.length - 1) {
            historyIndex.current++;
            const nextState = history[historyIndex.current];
            setSongData(nextState.songData);
            setBpm(nextState.bpm);
            setTimeSignature(nextState.timeSignature);
            setVersion(v => v + 1);
            toast.info("Redo");
        }
    }, [history, setBpm]);
    
    const addBar = useCallback(() => updateStateAndHistory(draft => { draft.push(generateInitialSongData(1)[0]); }, 'Add Bar'), [updateStateAndHistory]);
    const removeBar = useCallback(() => { if (songData.length > 1) updateStateAndHistory(draft => { draft.pop(); }, 'Remove Bar'); }, [songData.length, updateStateAndHistory]);
    const clearBar = useCallback((barIndex) => updateStateAndHistory(draft => { draft[barIndex] = generateInitialSongData(1)[0]; }, `Clear Bar ${barIndex + 1}`), [updateStateAndHistory]);
    const copyBar = useCallback((barIndex) => { const bar = songData[barIndex]; setCopiedBarData(bar); toast.success(`Bar ${barIndex + 1} copied.`); }, [songData]);
    const pasteBar = useCallback((barIndex) => { if (copiedBarData) updateStateAndHistory(draft => { draft[barIndex] = JSON.parse(JSON.stringify(copiedBarData)); }, `Paste Bar to ${barIndex + 1}`); }, [copiedBarData, updateStateAndHistory]);
    const copyPose = useCallback((barIndex, beatIndex) => { const beat = songData[barIndex]?.beats[beatIndex]; if (beat && (Object.keys(beat.jointInfo).length > 0 || beat.grounding.L || beat.grounding.R)) { setCopiedPoseData({ jointInfo: beat.jointInfo, grounding: beat.grounding }); toast.success(`Pose from B${barIndex+1}:S${beatIndex+1} copied.`); } else { toast.info("Nothing to copy from this beat."); } }, [songData]);
    const pastePose = useCallback((barIndex, beatIndex) => { if (copiedPoseData) { updateStateAndHistory(draft => { const beat = draft[barIndex].beats[beatIndex]; beat.jointInfo = JSON.parse(JSON.stringify(copiedPoseData.jointInfo)); beat.grounding = JSON.parse(JSON.stringify(copiedPoseData.grounding)); }, `Paste Pose to B${barIndex + 1}:S${beatIndex + 1}`); } }, [copiedPoseData, updateStateAndHistory]);
    const updateBeatDynamics = useCallback((barIndex, beatIndex, dynamics) => { updateStateAndHistory(draft => { const beat = draft[barIndex].beats[beatIndex]; if (dynamics.jointInfo) { if(!beat.jointInfo) beat.jointInfo = {}; Object.assign(beat.jointInfo, dynamics.jointInfo); } if (dynamics.grounding) { if(!beat.grounding) beat.grounding = {}; Object.assign(beat.grounding, dynamics.grounding); } }, `Update Dynamics B${barIndex + 1}:S${beatIndex + 1}`); }, [updateStateAndHistory]);
    const batchUpdateThumbnails = useCallback((thumbnailResults) => { updateStateAndHistory(draft => { thumbnailResults.forEach(result => { const { bar, beat, thumbnailBlob } = result; if (draft[bar] && draft[bar].beats[beat]) { if (draft[bar].beats[beat].videoThumbnail) URL.revokeObjectURL(draft[bar].beats[beat].videoThumbnail); draft[bar].beats[beat].videoThumbnail = URL.createObjectURL(thumbnailBlob); } }); }, 'Batch Update Thumbnails'); }, [updateStateAndHistory]);
    const setJointLock = useCallback((barIndex, beatIndex, jointAbbrev, duration) => { const lockDuration = duration > 0 ? duration : null; updateStateAndHistory(draft => { const beat = draft[barIndex]?.beats[beatIndex]; if (beat) { if (!beat.jointInfo[jointAbbrev]) beat.jointInfo[jointAbbrev] = {}; if (lockDuration) beat.jointInfo[jointAbbrev].lockDuration = lockDuration; else delete beat.jointInfo[jointAbbrev].lockDuration; } }, `Set ${jointAbbrev} Lock`); }, [updateStateAndHistory]);
    const handleSaveSequence = useCallback((kitName = 'default') => { const sequenceToSave = { metadata: { appName: "SĒQsync", version: "1.0", savedAt: new Date().toISOString(), kit: kitName }, bpm, timeSignature, sequence: songData, }; const blob = new Blob([JSON.stringify(sequenceToSave, null, 2)], { type: "application/json;charset=utf-8" }); saveAs(blob, `SĒQsync-sequence-${Date.now()}.seq`); toast.success("Sequence saved!"); }, [songData, bpm, timeSignature]);
    const handleLoadSequence = useCallback((file, setKitCallback) => { const reader = new FileReader(); reader.onload = (e) => { try { const loaded = JSON.parse(e.target.result); if (loaded.metadata?.appName === "SĒQsync" && loaded.sequence) { setSongData(loaded.sequence); setBpm(loaded.bpm || DEFAULT_BPM); setTimeSignature(loaded.timeSignature || DEFAULT_TIME_SIGNATURE); if (setKitCallback && loaded.metadata.kit) setKitCallback(loaded.metadata.kit); toast.success("Sequence loaded successfully!"); const snapshot = { songData: loaded.sequence, bpm: loaded.bpm || DEFAULT_BPM, timeSignature: loaded.timeSignature || DEFAULT_TIME_SIGNATURE }; setHistory([snapshot]); historyIndex.current = 0; setVersion(v => v + 1); } else { toast.error("Invalid SĒQsync file format."); } } catch (err) { toast.error("Failed to parse sequence file."); } }; reader.readAsText(file); }, [setBpm]);
    const applyTransitionToBeat = useCallback((barIndex, beatIndex, curveType, targetMode = 'BOTH') => { updateStateAndHistory(draft => { const beat = draft[barIndex]?.beats[beatIndex]; if (beat) { if (!beat.transition) beat.transition = {}; if (targetMode === 'POS' || targetMode === 'BOTH') beat.transition.poseCurve = curveType; if (targetMode === 'SEQ' || targetMode === 'BOTH') beat.transition.soundCurve = curveType; } }, `Apply Transition to B${barIndex+1}:S${beatIndex+1}`); }, [updateStateAndHistory]);
    const applyTransitionToAll = useCallback((barIndex, curveType, targetMode) => { updateStateAndHistory(draft => { const beats = draft[barIndex].beats; for (let i = 0; i < beats.length - 1; i++) { if (!beats[i].transition) beats[i].transition = {}; if (targetMode === 'POS' || targetMode === 'BOTH') beats[i].transition.poseCurve = curveType; if (targetMode === 'SEQ' || targetMode === 'BOTH') beats[i].transition.soundCurve = curveType; } }, `Apply All Transitions (${targetMode})`); }, [updateStateAndHistory]);

    const initializeSequenceFromOnsets = useCallback((onsets, newBpm, mediaDuration) => {
        if (!onsets || onsets.length === 0) {
            toast.warn("No onsets detected to map.");
            return;
        }

        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const totalBars = Math.ceil(mediaDuration / ((60 / newBpm) * sig.beatsPerBar));
        const newSongData = generateInitialSongData(totalBars > 0 ? totalBars : 1);
        const timePerStep = (60 / newBpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);

        onsets.forEach(onset => {
            const absoluteStepIndex = Math.floor(onset.time / timePerStep);
            const barIndex = Math.floor(absoluteStepIndex / UI_PADS_PER_BAR);
            const beatIndex = absoluteStepIndex % UI_PADS_PER_BAR;
            
            if (newSongData[barIndex] && newSongData[barIndex].beats[beatIndex]) {
                const targetBeat = newSongData[barIndex].beats[beatIndex];
                if(targetBeat.sounds.length < 4) {
                    targetBeat.sounds.push('HIT'); // Placeholder sound
                }
                targetBeat.waveform = onset.waveform;
                targetBeat.onsetTimestamp = onset.time;
            }
        });
        
        setSongData(newSongData);
        setBpmState(newBpm);
        // Reset history with this new state
        const snapshot = { songData: newSongData, bpm: newBpm, timeSignature };
        setHistory([snapshot]);
        historyIndex.current = 0;
        setVersion(v => v + 1);
        toast.success(`Mapped ${onsets.length} onsets across ${totalBars} bars.`);

    }, [timeSignature]);

    // --- CONTEXT VALUE ---
    const value = useMemo(() => ({
        songData, version, bpm, timeSignature, copiedBarData, copiedPoseData, history, historyIndex,
        setBpm, setTimeSignature, handleTapTempo, updateStateAndHistory, updateBeatDynamics, batchUpdateThumbnails,
        handleSaveSequence, handleLoadSequence, handleUndo, handleRedo, addBar, removeBar, clearBar,
        copyBar, pasteBar, copyPose, pastePose, setJointLock, applyTransitionToBeat, applyTransitionToAll,
        initializeSequenceFromOnsets,
    }), [
        songData, version, bpm, timeSignature, copiedBarData, copiedPoseData, history,
        setBpm, setTimeSignature, handleTapTempo, updateStateAndHistory, updateBeatDynamics, batchUpdateThumbnails,
        handleSaveSequence, handleLoadSequence, handleUndo, handleRedo, addBar, removeBar, clearBar,
        copyBar, pasteBar, copyPose, pastePose, setJointLock, applyTransitionToBeat, applyTransitionToAll,
        initializeSequenceFromOnsets,
    ]);

    return (
        <SequenceContext.Provider value={value}>
            {children}
        </SequenceContext.Provider>
    );
};

export const useSequence = () => {
    const context = useContext(SequenceContext);
    if (!context) throw new Error('useSequence must be used within a SequenceProvider');
    return context;
};