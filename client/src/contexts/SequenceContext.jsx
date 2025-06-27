import React, { createContext, useState, useCallback, useMemo, useContext } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_SONG_DATA, createDefaultBeatObject, UI_PADS_PER_BAR, DEFAULT_BPM, DEFAULT_TIME_SIGNATURE } from '../utils/constants';
import { merge } from 'lodash';

const SequenceContext = createContext(null);

export const SequenceProvider = ({ children }) => {
    // --- State Ownership ---
    const [songData, setSongData] = useState(() => JSON.parse(JSON.stringify(INITIAL_SONG_DATA)));
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [timeSignature, setTimeSignature] = useState(DEFAULT_TIME_SIGNATURE);

    const [history, setHistory] = useState(() => [JSON.stringify(songData)]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [currentSequenceFilename, setCurrentSequenceFilename] = useState('untitled.seq');
    const [copiedBarData, setCopiedBarData] = useState(null);
    const [copiedPoseData, setCopiedPoseData] = useState(null);

    const makeDeepCopy = useCallback((data) => JSON.parse(JSON.stringify(data)), []);

    const updateSongData = useCallback((newDataProducer, actionName = 'Update') => {
        setSongData(currentData => {
            const newData = newDataProducer(makeDeepCopy(currentData));
            const currentStateString = JSON.stringify(currentData);
            const newStateString = JSON.stringify(newData);
            if (currentStateString !== newStateString) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(newStateString);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
            return newData;
        });
    }, [history, historyIndex, makeDeepCopy]);

    // --- UNDO/REDO IMPLEMENTATION ---
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setSongData(JSON.parse(history[newIndex]));
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setSongData(JSON.parse(history[newIndex]));
        }
    }, [history, historyIndex]);
    
    const updateBeatDynamics = useCallback((barIndex, beatIndex, newDynamics) => {
        updateSongData(d => {
            const beatToUpdate = d[barIndex]?.beats?.[beatIndex];
            if (beatToUpdate) {
                merge(beatToUpdate, newDynamics);
            }
            return d;
        }, 'Update Beat Dynamics');
    }, [updateSongData]);

    const setBarCount = useCallback((numBars) => {
        if (numBars <= 0) return;
        updateSongData(d => {
            const currentNumBars = d.length;
            if (currentNumBars === numBars) return d;
            let newSongData = [...d];
            if (numBars > currentNumBars) {
                for (let i = currentNumBars; i < numBars; i++) {
                    newSongData.push({ id: i, beats: Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex)) });
                }
            } else {
                newSongData = newSongData.slice(0, numBars);
            }
            return newSongData;
        }, `Set Bar Count to ${numBars}`);
        toast.info(`Sequence resized to ${numBars} bars.`);
    }, [updateSongData]);

    const handleSaveSequence = useCallback((selectedKitName) => {
        try {
            const sequenceData = {
                version: '1.3.0',
                songData,
                bpm, // Use local state
                timeSignature, // Use local state
                soundKitName: selectedKitName
            };
            const dataStr = JSON.stringify(sequenceData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = currentSequenceFilename.endsWith('.seq') ? currentSequenceFilename : `${currentSequenceFilename}.seq`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Sequence saved as ${filename}.`);
        } catch (error) {
            console.error("Save sequence error:", error);
            toast.error("Could not save sequence.");
        }
    }, [songData, bpm, timeSignature, currentSequenceFilename]);

    const handleLoadSequence = useCallback((file, setSelectedKitName) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.songData) throw new Error("Invalid sequence file format.");
                setSongData(data.songData);
                setHistory([JSON.stringify(data.songData)]);
                setHistoryIndex(0);
                setBpm(data.bpm || DEFAULT_BPM); // Set local state
                setTimeSignature(data.timeSignature || DEFAULT_TIME_SIGNATURE); // Set local state
                setCurrentSequenceFilename(file.name.replace(/\.(json|seq)$/, ''));

                if (data.soundKitName && setSelectedKitName) {
                    setSelectedKitName(data.soundKitName);
                } else if (setSelectedKitName) {
                    setSelectedKitName('TR-808');
                }
                toast.success(`Sequence "${file.name}" loaded.`);
            } catch (error) {
                console.error("Load sequence error:", error);
                toast.error(`Failed to load sequence: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }, []); // Removed setters from dependency array as they are now local

    // --- STUBBED-OUT HANDLERS (to be fully implemented later) ---
    const addBar = useCallback(() => {
        updateSongData(d => {
            d.push({ id: d.length, beats: Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex)) });
            return d;
        }, 'Add Bar');
        toast.info('Bar added to sequence.');
    }, [updateSongData]);

    const removeBar = useCallback(() => {
        updateSongData(d => {
            if (d.length > 1) d.pop();
            return d;
        }, 'Remove Bar');
        toast.warn('Last bar removed.');
    }, [updateSongData]);

    const clearBar = useCallback((barIndex) => {
        updateSongData(d => {
            if (d[barIndex]) {
                d[barIndex].beats = Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex));
            }
            return d;
        }, 'Clear Bar');
        toast.info(`Bar ${barIndex + 1} cleared.`);
    }, [updateSongData]);
    
    const copyBar = useCallback((barIndex) => {
        const barToCopy = songData[barIndex];
        setCopiedBarData(makeDeepCopy(barToCopy));
        toast.success(`Bar ${barIndex + 1} copied.`);
    }, [songData, makeDeepCopy]);

    const pasteBar = useCallback((barIndex) => {
        if (!copiedBarData) return;
        updateSongData(d => {
            d[barIndex] = makeDeepCopy(copiedBarData);
            return d;
        }, 'Paste Bar');
        toast.success(`Bar pasted to position ${barIndex + 1}.`);
    }, [copiedBarData, makeDeepCopy, updateSongData]);
    
    const copyPose = useCallback((barIndex, beatIndex) => {
        const poseToCopy = songData[barIndex]?.beats[beatIndex];
        setCopiedPoseData(makeDeepCopy(poseToCopy));
        toast.success('Pose copied.');
    }, [songData, makeDeepCopy]);

    const pastePose = useCallback((barIndex, beatIndex) => {
        if (!copiedPoseData) return;
        updateSongData(d => {
            d[barIndex].beats[beatIndex] = makeDeepCopy(copiedPoseData);
            return d;
        }, 'Paste Pose');
    }, [copiedPoseData, makeDeepCopy, updateSongData]);


    const value = useMemo(() => ({
        songData, updateSongData, updateBeatDynamics,
        bpm, setBpm, timeSignature, setTimeSignature,
        history, historyIndex, handleUndo, handleRedo,
        currentSequenceFilename, setCurrentSequenceFilename,
        handleSaveSequence, handleLoadSequence,
        addBar, removeBar, clearBar, copyBar, pasteBar, copiedBarData,
        copyPose, pastePose, copiedPoseData
    }), [
        songData, bpm, timeSignature, history, historyIndex, currentSequenceFilename, copiedBarData, copiedPoseData,
        updateSongData, updateBeatDynamics, handleUndo, handleRedo, handleSaveSequence, handleLoadSequence,
        addBar, removeBar, clearBar, copyBar, pasteBar, copyPose, pastePose
    ]);

    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};

export const useSequence = () => {
    const context = useContext(SequenceContext);
    if (!context) throw new Error('useSequence must be used within a SequenceProvider');
    return context;
};