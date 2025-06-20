/* @refresh skip */
import React, { createContext, useState, useContext, useCallback } from 'react';
import createEmptyPose from '../utils/pose';

const SequenceContext = createContext(null);

const createEmptyBar = () => Array(16).fill(null).map(() => ({
    pose: createEmptyPose(),
    thumbnail: null,
    sound: null,
}));

const createInitialData = (bars = 2) => {
    const data = {};
    for (let i = 0; i < bars; i++) {
        data[i] = createEmptyBar();
    }
    return data;
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(() => createInitialData());
    const [history, setHistory] = useState([createInitialData()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [clipboard, setClipboard] = useState(null);

    const updateSongData = (newData, addToHistory = true) => {
        if (addToHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newData);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        setSongData(newData);
    };

    const setPoseForBeat = useCallback((barIndex, beatIndex, pose) => {
        const newData = JSON.parse(JSON.stringify(songData));
        if (!newData[barIndex]) newData[barIndex] = createEmptyBar();
        newData[barIndex][beatIndex].pose = pose;
        updateSongData(newData);
    }, [songData]);
    
    const setThumbnails = useCallback((thumbnails) => {
        setSongData(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData));
            const maxBar = Math.max(...Object.keys(thumbnails).map(Number), ...Object.keys(newData).map(Number));
            for(let i = 0; i <= maxBar; i++) {
                if(!newData[i]) newData[i] = createEmptyBar();
            }
            for (const bar in thumbnails) {
                if (newData[bar]) {
                    for (const beat in thumbnails[bar]) {
                        if (newData[bar][beat]) {
                            newData[bar][beat].thumbnail = thumbnails[bar][beat];
                        }
                    }
                }
            }
            updateSongData(newData, false);
            return newData;
        });
    }, []);

    const getBeatData = useCallback((barIndex, beatIndex) => {
        return songData[barIndex]?.[beatIndex] || { pose: createEmptyPose(), thumbnail: null, sound: null };
    }, [songData]);

    const resetSequence = (bars = 2) => {
        const initialData = createInitialData(bars);
        setSongData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
    };

    const copyBeat = (barIndex, beatIndex) => {
        if (songData[barIndex]?.[beatIndex]) {
            setClipboard({ type: 'beat', data: songData[barIndex][beatIndex] });
        }
    };

    const pasteBeat = (barIndex, beatIndex) => {
        if (clipboard?.type === 'beat') {
            const newData = { ...songData };
            newData[barIndex][beatIndex] = clipboard.data;
            updateSongData(newData);
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setSongData(history[newIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setSongData(history[newIndex]);
        }
    };

    const onSave = useCallback(() => {
        console.log('[Sequence] Saving sequence data...', songData);
        // In a real app, this would trigger a file download or API call.
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "sequence.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }, [songData]);

    const onLoad = useCallback((loadedData) => {
        console.log('[Sequence] Loading sequence data...');
        // Here, you would parse the loaded file content and update the state
        // For now, we'll just log it.
        // updateSongData(loadedData);
    }, []);

    const onAddSound = (barIndex, beatIndex) => console.log(`Placeholder: Add sound to ${barIndex}:${beatIndex}`);
    const onDeleteSound = (barIndex, beatIndex) => console.log(`Placeholder: Delete sound from ${barIndex}:${beatIndex}`);
    const onClearPoseData = (barIndex, beatIndex) => {
        console.log(`Placeholder: Clear pose from ${barIndex}:${beatIndex}`);
        const newData = JSON.parse(JSON.stringify(songData));
        if (newData[barIndex]?.[beatIndex]) {
            newData[barIndex][beatIndex].pose = createEmptyPose();
            updateSongData(newData);
        }
    };

    const value = {
        songData,
        getBeatData,
        setPoseForBeat,
        setThumbnails,
        resetSequence,
        copyBeat,
        pasteBeat,
        undo,
        redo,
        onSave, 
        onLoad,
        history,
        historyIndex,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        onAddSound,
        onDeleteSound,
        onClearPoseData,
    };

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