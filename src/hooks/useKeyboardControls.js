import { useEffect, useCallback } from 'react';
import { useUIState, MODES } from '../contexts/UIStateContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useSequence } from '../contexts/SequenceContext';

// Define key-to-beat mappings
const TOP_ROW_KEYS = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7 };
const QWERTY_ROW_KEYS = { 'q': 8, 'w': 9, 'e': 10, 'r': 11, 't': 12, 'y': 13, 'u': 14, 'i': 15 };

export const useKeyboardControls = () => {
    const { setCurrentMode, selectedBar, setSelectedBar } = useUIState();
    const { togglePlay, toggleRecord } = usePlayback();
    const { triggerBeat } = useSequence(); // We'll add this new function to SequenceContext

    const handleKeyDown = useCallback((event) => {
        // Ignore key presses if typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        const key = event.key.toLowerCase();
        let beatIndex = -1;

        if (TOP_ROW_KEYS[key] !== undefined) {
            beatIndex = TOP_ROW_KEYS[key];
        } else if (QWERTY_ROW_KEYS[key] !== undefined) {
            beatIndex = QWERTY_ROW_KEYS[key];
        }

        if (beatIndex !== -1) {
            event.preventDefault();
            triggerBeat(selectedBar, beatIndex);
            return;
        }

        switch (key) {
            case 'arrowup':
                event.preventDefault();
                togglePlay();
                break;
            case 'arrowdown':
                event.preventDefault();
                toggleRecord();
                break;
            case 'arrowleft':
                event.preventDefault();
                setSelectedBar(prev => Math.max(0, prev - 1));
                break;
            case 'arrowright':
                event.preventDefault();
                // Assuming a max of 4 bars for now, can be made dynamic later
                setSelectedBar(prev => Math.min(3, prev + 1)); 
                break;
            case 'p':
                event.preventDefault();
                setCurrentMode(MODES.POS);
                break;
            case 's':
                event.preventDefault();
                setCurrentMode(MODES.SEQ);
                break;
            default:
                break;
        }
    }, [selectedBar, setSelectedBar, setCurrentMode, togglePlay, toggleRecord, triggerBeat]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};