// /client/src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';
import { useUIState } from '../contexts/UIStateContext.jsx';
import { usePlayback } from '../contexts/PlaybackContext.jsx';
import { useSequence } from '../contexts/SequenceContext.jsx';
import { useMedia } from '../contexts/MediaContext.jsx'; // To get the video element
import { unlockAudioContext } from '../utils/audioManager.js';

// Maps keyboard keys to beat pad indices (0-15)
const KEY_TO_BEAT_MAP = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7,
  'q': 8, 'w': 9, 'e': 10, 'r': 11, 't': 12, 'y': 13, 'u': 14, 'i': 15,
};

// Maps keys to foot grounding presets
const FOOT_PRESET_MAP = {
    'a': { side: 'L', notation: 'LF13' },      // Inner Blade (Go-To)
    's': { side: 'L', notation: 'LF23' },      // Outer Blade (Go)
    'd': { side: 'L', notation: 'LF123T12345' }, // Full Plant
    
    'k': { side: 'R', notation: 'RF13' },      // Inner Blade (Go-To)
    'l': { side: 'R', notation: 'RF23' },      // Outer Blade (Go)
    ';': { side: 'R', notation: 'RF123T12345' }, // Full Plant
};

export const useKeyboardControls = () => {
    const { 
        selectedBar, setSelectedBar, 
        editingBeatIndex, isEditMode,
        isLiveCamActive
    } = useUIState();

    const { togglePlay, toggleRecord } = usePlayback();
    const { triggerBeat, setPoseForBeat, songData } = useSequence();
    const { videoRef } = useMedia();

    const handleKeyDown = useCallback((event) => {
        // Ignore key presses if typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();
        
        // --- Beat Triggers (1-8, q-i) ---
        if (KEY_TO_BEAT_MAP[key] !== undefined) {
            event.preventDefault();
            unlockAudioContext();
            triggerBeat(selectedBar, KEY_TO_BEAT_MAP[key], videoRef.current);
            return;
        }

        // --- Foot Grounding Presets (only in Edit Mode with a selected beat) ---
        if (isEditMode && editingBeatIndex !== null && FOOT_PRESET_MAP[key]) {
            event.preventDefault();
            const { side, notation } = FOOT_PRESET_MAP[key];
            // Update the grounding data for the currently selected beat
            setPoseForBeat(selectedBar, editingBeatIndex, { 
                grounding: { [side]: notation }
            });
            return;
        }

        // --- Global Transport & Navigation ---
        switch (key) {
            case ' ': // Spacebar for Play/Pause
                event.preventDefault();
                togglePlay();
                break;
            case 'arrowup': // Up arrow for Record
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
                break;
        }
    }, [
        selectedBar, editingBeatIndex, isEditMode, songData.bars,
        setSelectedBar, togglePlay, toggleRecord, triggerBeat, 
        setPoseForBeat, videoRef
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};