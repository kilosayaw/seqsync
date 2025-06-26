// client/src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';
import { useUIState } from '../contexts/UIStateContext';
import { useSequence } from '../contexts/SequenceContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { 
    MODES,
    KEYBOARD_LAYOUT_MODE_SEQ, 
    KEYBOARD_TRANSPORT_CONTROLS,
    KEYBOARD_MODE_SWITCH,
    KEYBOARD_FOOT_GROUNDING
} from '../utils/constants';
import { playSound } from '../utils/audioManager';

export const useKeyboardControls = () => {
    // Consume all necessary contexts
    const { 
        viewMode, setViewMode, currentEditingBar, activeBeatIndex, 
        currentSelectedKitObject, handleBeatClick,
    } = useUIState();

    const { songData, updateSongData } = useSequence();
    const { handlePlayPause, handleStop } = usePlayback();

    const handleKeyDown = useCallback((e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        const keyLower = e.key.toLowerCase();

        // --- SHIFT KEY LOGIC REMOVED TO PREVENT CRASH ---
        // We will re-implement this with a more robust state update pattern later.

        const newMode = KEYBOARD_MODE_SWITCH[keyLower];
        if (newMode && newMode !== viewMode) {
            e.preventDefault();
            setViewMode(newMode);
            return;
        }

        const transportAction = KEYBOARD_TRANSPORT_CONTROLS[keyLower];
        if (transportAction) {
            e.preventDefault();
            if (transportAction === 'playPause') handlePlayPause();
            else if (transportAction === 'stop') handleStop();
            return;
        }

        if (viewMode === MODES.SEQ) {
            const beatIndex = KEYBOARD_LAYOUT_MODE_SEQ[keyLower];
            if (beatIndex !== undefined) {
                e.preventDefault();
                handleBeatClick(currentEditingBar, beatIndex);
                const soundsToPlay = songData?.[currentEditingBar]?.beats?.[beatIndex]?.sounds || [];
                if (soundsToPlay.length > 0) {
                    soundsToPlay.forEach(soundName => {
                        const sound = currentSelectedKitObject.sounds.find(s => s.name === soundName);
                        if (sound?.url) playSound(sound.url);
                    });
                }
                return;
            }
        }
        
        if (viewMode === MODES.POS) {
             const groundingAction = KEYBOARD_FOOT_GROUNDING[keyLower];
            if (groundingAction) {
                e.preventDefault();
                const { side, points } = groundingAction;
                // Using a functional update to get the latest state
                updateSongData(d => {
                    // Defensive check: ensure the bar and beat exist
                    if (d[currentEditingBar] && d[currentEditingBar].beats[activeBeatIndex]) {
                        const beat = d[currentEditing-Bar].beats[activeBeatIndex];
                        if (!beat.grounding) beat.grounding = { L: null, R: null, L_weight: 50 };
                        beat.grounding[side] = points;
                    }
                    return d;
                }, `Grounding Hotkey: ${side}`);
            }
        }

    }, [
        viewMode, setViewMode, handlePlayPause, handleStop, handleBeatClick, 
        songData, currentEditingBar, activeBeatIndex, currentSelectedKitObject, updateSongData
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};