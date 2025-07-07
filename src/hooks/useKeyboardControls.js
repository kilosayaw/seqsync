// src/hooks/useKeyboardControls.js

import { useEffect } from 'react';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    '7': 8, '8': 9, '9': 10, '0': 11,
    'u': 12, 'i': 13, 'o': 14, 'p': 15,
};

export const useKeyboardControls = (leftDeckHandler, rightDeckHandler) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.repeat) return;
            const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];

            if (padIndex !== undefined) {
                // Determine if the key belongs to the left or right deck
                if (padIndex < 8) {
                    // It's a left deck key, pass its local index (0-7)
                    leftDeckHandler(padIndex);
                } else {
                    // It's a right deck key, pass its local index (0-7)
                    rightDeckHandler(padIndex - 8);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [leftDeckHandler, rightDeckHandler]);
};