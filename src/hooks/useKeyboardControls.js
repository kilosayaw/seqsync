import { useEffect } from 'react';
import { usePadMapping } from './usePadMapping';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';

// Maps keyboard keys to their corresponding pad index (0-15)
const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    '7': 8, '8': 9, '9': 10, '0': 11,
    'u': 12, 'i': 13, 'o': 14, 'p': 15,
};

export const useKeyboardControls = () => {
    const padMap = usePadMapping();
    const { seekToGlobalStep, auditionSlice } = usePlayback();
    const { setSelectedBeat, selectedBar } = useUIState();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (document.activeElement.tagName === 'INPUT') return; // Ignore inputs in modals

            const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
            
            if (padIndex !== undefined && padMap[padIndex] && !padMap[padIndex].isEmpty) {
                event.preventDefault();
                const targetPad = padMap[padIndex];
                
                console.log(`[Keyboard] Key '${event.key}' triggered Pad ${targetPad.displayLabel}`);
                
                // Set the selected bar/beat to match the pad's location
                setSelectedBeat(targetPad.beat);
                // Seek and play the slice
                seekToGlobalStep(targetPad.globalStep);
                auditionSlice(targetPad.seekTime);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [padMap, seekToGlobalStep, auditionSlice, setSelectedBeat, selectedBar]);
};