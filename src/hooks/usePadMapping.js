import { useMemo } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { useMedia } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';

export const usePadMapping = () => {
    const { selectedBar } = useUIState();
    const { songData, totalBars } = useSequence();
    const { firstBeatOffset, duration } = useMedia();
    const { bpm } = usePlayback();

    return useMemo(() => {
        if (duration === 0 || !bpm) return Array(16).fill({ isEmpty: true });
        
        const pads = [];
        const stepDuration = (60 / bpm) / 4;

        for (let i = 0; i < 16; i++) {
            const globalStep = ((selectedBar - 1) * 16) + i;
            
            if (globalStep >= totalBars * 16) {
                pads.push({ key: `pad-empty-${i}`, isEmpty: true });
                continue;
            }

            const seekTime = firstBeatOffset + (globalStep * stepDuration);

            pads.push({
                key: `pad-${selectedBar}-${i}`,
                seekTime: seekTime,
                globalStep: globalStep,
                poseData: songData[globalStep]?.poseData,
                bar: selectedBar,
                beat: i,
            });
        }
        return pads;
    }, [selectedBar, songData, totalBars, firstBeatOffset, duration, bpm]);
};