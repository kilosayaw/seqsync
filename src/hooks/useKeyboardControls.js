// src/hooks/useKeyboardControls.js
import { useEffect, useCallback } from 'react';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    '7': 8, '8': 9, '9': 10, '0': 11,
    'u': 12, 'i': 13, 'o': 14, 'p': 15,
};

export const useKeyboardControls = (onPadTrigger) => {
    const handleKeyDown = useCallback((event) => {
        if (event.repeat) return;
        const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];

        if (padIndex !== undefined) {
            // Call the single handler function passed from ProLayout
            onPadTrigger(padIndex);
        }
    }, [onPadTrigger]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};