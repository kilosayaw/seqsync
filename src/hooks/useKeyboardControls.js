import { useEffect } from 'react';
import { usePadMapping } from './usePadMapping';
import { useUIState } from '../context/UIStateContext';

const KEY_TO_PAD_MAP = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    'q': 4, 'w': 5, 'e': 6, 'r': 7,
    '7': 8, '8': 9, '9': 10, '0': 11,
    'u': 12, 'i': 13, 'o': 14, 'p': 15,
};

export const useKeyboardControls = () => {
    const { setSelectedBeat } = useUIState();
    const { handlePadDown, handlePadUp } = usePadMapping(); // Use new handlers

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.repeat) return; // Prevent repeated events while key is held
            const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
            
            if (padIndex !== undefined) {
                console.log(`[Keyboard] Key Down: "${event.key}", Pad ${padIndex + 1}`);
                setSelectedBeat(padIndex);
                handlePadDown(padIndex); // Call centralized handler
            }
        };

        const handleKeyUp = (event) => {
            const padIndex = KEY_TO_PAD_MAP[event.key.toLowerCase()];
            if (padIndex !== undefined) {
                console.log(`[Keyboard] Key Up: "${event.key}", Pad ${padIndex + 1}`);
                handlePadUp(); // Call centralized handler
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setSelectedBeat, handlePadDown, handlePadUp]);
};