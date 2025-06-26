// /client/src/contexts/SequenceContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import MusicTempo from 'music-tempo';
import { toast } from 'react-toastify';
import { produce } from 'immer';
import { useSequencerSettings } from './SequencerSettingsContext.jsx';
import { downloadFile } from '../utils/fileUtils.js';
import { getAudioContext, playAudioSlice, playSound, unlockAudioContext } from '../utils/audioManager.js';

const SequenceContext = createContext(null);

const createEmptyPose = () => ({ jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 } });
const createEmptyBar = () => Array(16).fill(null).map((_, i) => ({ beatIndex: i, pose: createEmptyPose(), sounds: [], thumbnail: null, waveform: null }));
const createInitialData = (bars = 4) => {
    const data = { audioBuffer: null, audioFileName: null, videoUrl: null, bars: {}, gridOffset: 0 };
    for (let i = 0; i < bars; i++) { data.bars[i] = createEmptyBar(); }
    return data;
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [hasPrimaryMedia, setHasPrimaryMedia] = useState(false);
    const [history, setHistory] = useState([createInitialData()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const { bpm, setBpm } = useSequencerSettings();
    const clipStopTimerRef = useRef(null);
    
    // --- THIS IS THE FULLY IMPLEMENTED WAVEFORM FUNCTION ---
    const generateAndStoreWaveforms = useCallback((buffer, currentBpm, offset = 0) => {
        if (!buffer || currentBpm <= 0) return {};

        // Configuration for the visual output
        const WAVEFORM_POINTS_PER_BEAT = 32; // How many data points to show per beat button

        const channelData = buffer.getChannelData(0); // Use the left channel for analysis
        const totalSamples = channelData.length;
        const sampleRate = buffer.sampleRate;

        // Calculate how many 16th notes fit in the entire track
        const secondsPerBeat = 60 / currentBpm;
        const beatsPer16th = 4;
        const total16thNotesInTrack = Math.floor(buffer.duration / (secondsPerBeat / beatsPer16th));
        const totalBars = Math.ceil(total16thNotesInTrack / 16);

        // Calculate how many audio samples make up one 16th note
        const samplesPer16thNote = Math.floor(sampleRate * (secondsPerBeat / beatsPer16th));

        const newBars = {};
        for (let barIndex = 0; barIndex < totalBars; barIndex++) {
            newBars[barIndex] = createEmptyBar();
            for (let beatIndex = 0; beatIndex < 16; beatIndex++) {
                
                const overallBeatIndex = barIndex * 16 + beatIndex;
                const startSample = overallBeatIndex * samplesPer16thNote;

                // Ensure we don't read past the end of the buffer
                if (startSample >= totalSamples) continue;

                const endSample = Math.min(startSample + samplesPer16thNote, totalSamples);
                const beatSlice = channelData.slice(startSample, endSample);

                if (beatSlice.length === 0) continue;

                // Downsample the slice to get our visual points
                const waveformPoints = [];
                const samplesPerPoint = Math.floor(beatSlice.length / WAVEFORM_POINTS_PER_BEAT);

                for (let i = 0; i < WAVEFORM_POINTS_PER_BEAT; i++) {
                    const subChunkStart = i * samplesPerPoint;
                    const subChunkEnd = subChunkStart + samplesPerPoint;
                    const subChunk = beatSlice.slice(subChunkStart, subChunkEnd);
                    
                    // Find the peak (max absolute value) in this sub-chunk
                    let maxVal = 0;
                    for (let j = 0; j < subChunk.length; j++) {
                        const absVal = Math.abs(subChunk[j]);
                        if (absVal > maxVal) {
                            maxVal = absVal;
                        }
                    }
                    waveformPoints.push(maxVal);
                }
                // Assign the generated array of points to the beat
                newBars[barIndex][beatIndex].waveform = waveformPoints;
            }
        }
        return newBars;
    }, []);

    const updateSongData = useCallback((updater, addToHistory = true) => {
        const nextState = produce(songData, updater);
        setSongData(nextState);

        if (addToHistory) {
            const currentHistory = history.slice(0, historyIndex + 1);
            currentHistory.push(nextState);
            setHistory(currentHistory);
            setHistoryIndex(currentHistory.length - 1);
        }
    }, [songData, history, historyIndex]);

    const resetSequence = useCallback(() => {
        const initialData = createInitialData();
        setSongData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
        setHasPrimaryMedia(false);
        setBpm(120);
        toast.info("New project started.");
    }, [setBpm]);

    const processMediaFile = useCallback(async (file) => {
        if (!file) return;
        resetSequence();
        const audioContext = getAudioContext();
        if (!audioContext) { toast.error("AudioContext is not available."); return; }
        try {
            if (audioContext.state === 'suspended') await audioContext.resume();
            const arrayBuffer = await file.arrayBuffer();
            let audioBufferForAnalysis, finalVideoUrl = null, finalAudioBufferForPlayback = null;
            let detectedBpm = 120;

            if (file.type.startsWith('audio/')) {
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer);
                finalAudioBufferForPlayback = audioBufferForAnalysis;
            } else if (file.type.startsWith('video/')) {
                finalVideoUrl = URL.createObjectURL(file);
                audioBufferForAnalysis = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            }

            if (audioBufferForAnalysis) {
                const musicTempo = new MusicTempo(audioBufferForAnalysis.getChannelData(0));
                detectedBpm = Math.round(musicTempo.tempo) || 120;
                setBpm(detectedBpm);
                toast.success(`BPM detected: ${detectedBpm}`);
                
                // Call the waveform generation function
                const generatedBars = generateAndStoreWaveforms(audioBufferForAnalysis, detectedBpm, 0);
                
                // Update the state with the generated bars
                updateSongData(draft => {
                    draft.bars = generatedBars;
                    draft.audioBuffer = finalAudioBufferForPlayback; 
                    draft.videoUrl = finalVideoUrl;
                    draft.audioFileName = file.name;
                }, false);
            } else {
                 updateSongData(draft => {
                    draft.audioBuffer = finalAudioBufferForPlayback; 
                    draft.videoUrl = finalVideoUrl;
                    draft.audioFileName = file.name;
                }, false);
            }
            
            setHasPrimaryMedia(true);
            toast.success(`Media "${file.name}" loaded successfully.`);
        } catch (error) { console.error("Error processing media file:", error); toast.error("Could not process media file.");}
    }, [resetSequence, setBpm, generateAndStoreWaveforms, updateSongData]);

    const loadAudioFile = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (hasPrimaryMedia) {
            if (window.confirm("This will replace the current media and clear your sequence. Are you sure?")) processMediaFile(file);
            else if(event.target) event.target.value = null;
        } else processMediaFile(file);
        if(event.target) event.target.value = null;
    }, [hasPrimaryMedia, processMediaFile]);

    const getBeatData = useCallback((barIndex, beatIndex) => {
        const bar = songData.bars?.[barIndex];
        if (!bar) return { pose: createEmptyPose(), sounds: [] };
        return bar[beatIndex] || { pose: createEmptyPose(), sounds: [] };
    }, [songData]);

    const triggerBeat = useCallback((bar, beat, videoElement) => {
        unlockAudioContext();
        const beatData = getBeatData(bar, beat);
        if (!beatData) return;
        if (beatData.sounds?.length > 0) beatData.sounds.forEach(soundUrl => playSound(soundUrl));
        if (songData.videoUrl && videoElement) {
            if (clipStopTimerRef.current) clearTimeout(clipStopTimerRef.current);
            const secondsPer16thNote = (60.0 / bpm) / 4;
            const seekTime = (songData.gridOffset || 0) + ((bar * 16 + beat) * secondsPer16thNote);
            if (seekTime < videoElement.duration) {
                videoElement.currentTime = seekTime;
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        clipStopTimerRef.current = setTimeout(() => { videoElement.pause(); }, secondsPer16thNote * 1000);
                    }).catch(error => { console.warn("Video playback was prevented.", error); });
                }
            }
        } else if (songData.audioBuffer) playAudioSlice(songData.audioBuffer, bpm, songData.gridOffset, bar, beat);
    }, [getBeatData, songData.audioBuffer, songData.videoUrl, bpm, songData.gridOffset]);

    const addSoundToBeat = useCallback((barIndex, beatIndex, soundUrl) => {
        updateSongData(draft => {
            const beat = draft.bars[barIndex]?.[beatIndex];
            if (beat) {
                if (!beat.sounds) beat.sounds = [];
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundUrl)) beat.sounds.push(soundUrl);
            }
        });
    }, [updateSongData]);

    const removeSoundFromBeat = useCallback((barIndex, beatIndex, soundUrlToRemove) => {
        updateSongData(draft => {
            const beat = draft.bars[barIndex]?.[beatIndex];
            if (beat?.sounds) beat.sounds = beat.sounds.filter(s => s !== soundUrlToRemove);
        });
    }, [updateSongData]);

    const setPoseForBeat = useCallback((barIndex, beatIndex, dataPacket) => {
        updateSongData(draft => {
            if (!draft.bars[barIndex]) draft.bars[barIndex] = createEmptyBar();
            const targetBeat = draft.bars[barIndex][beatIndex];
            if (targetBeat) {
                const { thumbnail, ...poseInfo } = dataPacket;
                targetBeat.pose = { ...targetBeat.pose, ...poseInfo, jointInfo: { ...(targetBeat.pose?.jointInfo || {}), ...(poseInfo.jointInfo || {}) }, grounding: { ...(targetBeat.pose?.grounding || {}), ...(poseInfo.grounding || {}) } };
                if (thumbnail) targetBeat.thumbnail = thumbnail;
            }
        }, true);
    }, [updateSongData]);
    
    const undo = () => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); setSongData(history[newIndex]); } };
    const redo = () => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); setSongData(history[newIndex]); } };
    const onSave = useCallback(() => { if (!songData) { console.error("No sequence data to save."); return; } try { const dataToSave = { ...songData, audioBuffer: null, videoUrl: null }; const dataStr = JSON.stringify(dataToSave, null, 2); const fileName = `sequence-${Date.now()}.seqsync.json`; downloadFile(dataStr, fileName, "application/json"); toast.success("Sequence saved!"); } catch (error) { console.error("Failed to save sequence:", error); toast.error("Failed to save sequence."); } }, [songData]);
    const onLoad = useCallback((file) => { if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const loadedData = JSON.parse(e.target.result); if (loadedData && typeof loadedData.bars === 'object') { const initialData = createInitialData(); const finalData = { ...initialData, ...loadedData, audioBuffer: null, videoUrl: null }; updateSongData(finalData, true); setHasPrimaryMedia(false); toast.success(`Sequence "${file.name}" loaded.`); } else { throw new Error("Invalid sequence file format."); } } catch (error) { console.error("Failed to load sequence file:", error); toast.error("Failed to load or parse sequence file."); } }; reader.readAsText(file); }, [updateSongData]);
    const setGridOffset = useCallback((newOffset) => { updateSongData(draft => { draft.gridOffset = newOffset; }, true); toast.info(`Grid offset adjusted.`); }, [updateSongData]);
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const value = {
        songData, hasPrimaryMedia, loadAudioFile, resetSequence, getBeatData,
        setPoseForBeat, addSoundToBeat, removeSoundFromBeat, triggerBeat,
        onSave, onLoad, updateSongData, undo, redo, canUndo, canRedo,
        setGridOffset, resetSequence,
    };

    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};

export const useSequence = () => {
    const context = useContext(SequenceContext);
    if (!context) throw new Error('useSequence must be used within a SequenceProvider');
    return context;
};