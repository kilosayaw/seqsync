import React, { createContext, useContext, useState, useCallback } from 'react';

const initialSequenceState = {
    metadata: { title: 'Untitled', bpm: 120, url: null },
    timeSignature: { beats: 4, subdivision: 4 },
    bars: [{ barNumber: 1, beats: Array(16).fill({ notation: null }) }]
};

const SequenceContext = createContext({
    sequence: initialSequenceState,
    updateNotation: () => console.warn('SequenceContext not ready'),
    updateMetadata: () => console.warn('SequenceContext not ready'),
    resizeSequence: () => console.warn('SequenceContext not ready'),
});

export const useSequence = () => useContext(SequenceContext);

export const SequenceProvider = ({ children }) => {
    const [sequence, setSequence] = useState(initialSequenceState);

    const updateNotation = useCallback((barIndex, beatIndex, newNotation) => {
        console.log(`[SequenceContext] Updating notation at Bar ${barIndex + 1}, Beat ${beatIndex + 1}`);
        setSequence(prev => {
            const newBars = [...prev.bars];
            const newBeats = [...newBars[barIndex].beats];
            newBeats[beatIndex] = { ...newBeats[beatIndex], notation: newNotation };
            newBars[barIndex] = { ...newBars[barIndex], beats: newBeats };
            return { ...prev, bars: newBars };
        });
    }, []);

    const updateMetadata = useCallback((newMetadata) => {
        console.log('[SequenceContext] Updating metadata:', newMetadata);
        setSequence(prev => ({ ...prev, metadata: { ...prev.metadata, ...newMetadata } }));
    }, []);
    
    const resizeSequence = useCallback((newBarCount) => {
        setSequence(prev => {
            const currentBarCount = prev.bars.length;
            if (newBarCount === currentBarCount) return prev;
            const newBars = [...prev.bars];
            if (newBarCount > currentBarCount) {
                for (let i = currentBarCount; i < newBarCount; i++) {
                    newBars.push({
                        barNumber: i + 1,
                        beats: Array(prev.timeSignature.beats * prev.timeSignature.subdivision).fill({ notation: null })
                    });
                }
            } else {
                newBars.length = newBarCount;
            }
            console.log(`[SequenceContext] Resized sequence from ${currentBarCount} to ${newBarCount} bars.`);
            return { ...prev, bars: newBars };
        });
    }, []);

    const value = { sequence, updateNotation, updateMetadata, resizeSequence };

    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};