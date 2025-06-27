import { useEffect, useCallback } from 'react';
import { useUIState } from '../contexts/UIStateContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { MODES, UI_PADS_PER_BAR } from '../utils/constants';

// --- HOTKEY MAPPINGS ---
// This declarative approach is cleaner than large switch statements.
const KEY_ACTIONS = {
    ' ': { action: 'playPause', modes: ['POS', 'SEQ'] },
    'enter': { action: 'stop', modes: ['POS', 'SEQ'] },
    'p': { action: 'setViewMode', payload: MODES.POS, modes: ['POS', 'SEQ'] },
    's': { action: 'setViewMode', payload: MODES.SEQ, modes: ['POS', 'SEQ'] },
    'arrowright': { action: 'navigateBeat', payload: 1, modes: ['POS', 'SEQ'] },
    'arrowleft': { action: 'navigateBeat', payload: -1, modes: ['POS', 'SEQ'] },
    'arrowdown': { action: 'navigateBeat', payload: 8, modes: ['POS', 'SEQ'] },
    'arrowup': { action: 'navigateBeat', payload: -8, modes: ['POS', 'SEQ'] },
    '[': { action: 'nudgeFader', payload: -5, modes: ['POS'] }, // Nudge fader left
    ']': { action: 'nudgeFader', payload: 5, modes: ['POS'] },  // Nudge fader right
};

export const useKeyboardControls = () => {
    const { viewMode, setViewMode, activeBeatIndex, handleBeatClick, activeEditingJoint, nudgeFaderValue, nudgeKneeValue } = useUIState();
    const { handlePlayPause, handleStop } = usePlayback();

    const handleKeyDown = useCallback((e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        const key = e.key.toLowerCase();
        
        // --- DEFINITIVE FIX: Updated knee control logic ---
        if (activeEditingJoint === 'LK' || activeEditingJoint === 'RK') {
            e.preventDefault();
            const side = activeEditingJoint.charAt(0);
            const step = 0.1; // How much each key press moves the knee vector
            switch (key) {
                case 'i': nudgeKneeValue(side, 0, step); return;  // Up
                case 'k': nudgeKneeValue(side, 0, -step); return; // Down
                case 'j': nudgeKneeValue(side, -step, 0); return; // Left
                case 'l': nudgeKneeValue(side, step, 0); return;  // Right
            }
        }
        
        // Fallback to general controls if no specific context matches
        const actionConfig = KEY_ACTIONS[key];
        if (!actionConfig || !actionConfig.modes.includes(viewMode)) return;

        e.preventDefault();
        switch (actionConfig.action) {
            case 'playPause': handlePlayPause(); break;
            case 'stop': handleStop(); break;
            case 'setViewMode': setViewMode(actionConfig.payload); break;
            case 'navigateBeat': {
                let nextBeat = (activeBeatIndex + actionConfig.payload + UI_PADS_PER_BAR) % UI_PADS_PER_BAR;
                handleBeatClick(nextBeat);
                break;
            }
            case 'nudgeFader': nudgeFaderValue(actionConfig.payload); break;
        }
    }, [
        viewMode, setViewMode, activeBeatIndex, handleBeatClick, activeEditingJoint,
        handlePlayPause, handleStop, nudgeFaderValue, nudgeKneeValue
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};