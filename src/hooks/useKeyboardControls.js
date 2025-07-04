import { useEffect, useCallback } from 'react';
// Correctly imports from the robust UIStateContext
import { useUIState } from '../context/UIStateContext';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    'a': 8, 's': 9, 'd': 10, 'f': 11, // Standard MPC/DAW layout
    'z': 12, 'x': 13, 'c': 14, 'v': 15,
};

export const useKeyboardControls = () => {
    // Correctly destructuring from the UI state, not the mapping hook
    const { handlePadDown, handlePadUp } = useUIState();

    const handleKeyDown = useCallback((event) => {
        if (event.repeat) return;
        const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        
        if (padIndex !== undefined) {
            console.log(`[Keyboard] Key Down: "${event.key}", Pad ${padIndex + 1}`);
            handlePadDown(padIndex);
        }
    }, [handlePadDown]);

    const handleKeyUp = useCallback((event) => {
        const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        if (padIndex !== undefined) {
            // We can call the generic handlePadUp as it just clears the state
            handlePadUp();
        }
    }, [handlePadUp]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);
};