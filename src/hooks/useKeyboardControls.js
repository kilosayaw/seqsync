// src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    '5': 4, '6': 5, '7': 6, '8': 7,
};

export const useKeyboardControls = (onKeyDown, onKeyUp) => {
    const handleKeyDown = useCallback((event) => {
        if (event.repeat) return;
        // The key maps directly to the local pad index (0-7).
        const localPadIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        if (localPadIndex !== undefined && onKeyDown) {
            onKeyDown(localPadIndex);
        }
    }, [onKeyDown]);

    const handleKeyUp = useCallback((event) => {
        const localPadIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        if (localPadIndex !== undefined && onKeyUp) {
            onKeyUp(localPadIndex);
        }
    }, [onKeyUp]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);
};