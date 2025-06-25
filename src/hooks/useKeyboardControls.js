// /client/src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';
import { useUIState } from '../contexts/UIStateContext.jsx';
import { usePlayback } from '../contexts/PlaybackContext.jsx';
import { useSequence } from '../contexts/SequenceContext.jsx';
import { unlockAudioContext } from '../utils/audioManager.js';

// Define key-to-beat mappings
const KEY_TO_BEAT_MAP = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7,
  'q': 8, 'w': 9, 'e': 10, 'r': 11, 't': 12, 'y': 13, 'u': 14, 'i': 15,
};

// Define foot grounding presets
const FOOT_PRESET_MAP = {
    'a': { side: 'L', notation: 'LF1' },
    's': { side: 'L', notation: 'LF2' },
    'd': { side: 'L', notation: 'LF3' },
    'f': { side: 'L', notation: 'LF12' },
    'g': { side: 'L', notation: 'LF123T12345' },
    'z': { side: 'L', notation: 'LF23' },
    'x': { side: 'L', notation: 'LF13' },
    'c': { side: 'L', notation: 'LFT1' },
    'v': { side: 'L', notation: 'LFT1Tip' },
    'b': { side: 'L', notation: 'LFT1Over' },

    'h': { side: 'R', notation: 'RF1' },
    'j': { side: 'R', notation: 'RF2' },
    'k': { side: 'R', notation: 'RF3' },
    'l': { side: 'R', notation: 'RF12' },
    ';': { side: 'R', notation: 'RF123T12345' },
    'n': { side: 'R', notation: 'R23' },
    'm': { side: 'R', notation: 'R13' },
    ',': { side: 'R', notation: 'RFT1' },
    '.': { side: 'R', notation: 'RFT1Tip' },
    '/': { side: 'R', notation: 'RFT1Over' },
};

export const useKeyboardControls = () => {
    const { selectedBar, setSelectedBar, editingBeatIndex, isEditMode } = useUIState();
    const { togglePlay, toggleRecord } = usePlayback();
    const { triggerBeat, setPoseForBeat, songData } = useSequence();

    const handleKeyDown = useCallback((event) => {
        // Ignore key presses if typing in an input field to prevent unwanted actions.
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();
        
        // --- 1. Beat Triggers (1-8, q-i) ---
        // This is the highest priority check.
        if (KEY_TO_BEAT_MAP[key] !== undefined) {
            event.preventDefault();
            unlockAudioContext(); // Ensure audio is ready to play.
            triggerBeat(selectedBar, KEY_TO_BEAT_MAP[key]);
            return; // Stop further execution
        }

        // --- 2. Foot Grounding Presets (only active in Edit Mode) ---
        // Checks if a foot key was pressed while a beat is selected for editing.
        if (isEditMode && editingBeatIndex !== null && FOOT_PRESET_MAP[key]) {
            event.preventDefault();
            const { side, notation } = FOOT_PRESET_MAP[key];
            // Update the grounding data for the currently selected beat.
            setPoseForBeat(selectedBar, editingBeatIndex, { 
                grounding: { [side]: notation }
            });
            return; // Stop further execution
        }

        // --- 3. Global Transport & Navigation ---
        // This runs if no beat or grounding key was pressed.
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
                const totalBars = Object.keys(songData.bars).length || 1;
                setSelectedBar(prev => Math.min(totalBars - 1, prev + 1)); 
                break;
            default:
                // No default action needed for other keys.
                break;
        }
    }, [
        // Dependency array: ensures the function always has the latest state and functions.
        selectedBar, 
        editingBeatIndex, 
        isEditMode,
        songData.bars,
        setSelectedBar, 
        togglePlay, 
        toggleRecord, 
        triggerBeat, 
        setPoseForBeat
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};