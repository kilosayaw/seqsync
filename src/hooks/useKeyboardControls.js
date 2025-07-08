// src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    '7': 8, '8': 9, '9': 10, '0': 11,
    'u': 12, 'i': 13, 'o': 14, 'p': 15,
};

export const useKeyboardControls = (onKeyDown, onKeyUp) => {
    const handleKeyDown = useCallback((event) => {
        if (event.repeat) return;
        const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        if (padIndex !== undefined && onKeyDown) {
            onKeyDown(padIndex);
        }
    }, [onKeyDown]);

    const handleKeyUp = useCallback((event) => {
        const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
        if (padIndex !== undefined && onKeyUp) {
            onKeyUp(padIndex);
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