import { useCallback, useRef } from 'react';

export const useLongPress = (onClick, onLongPress, { ms = 400 } = {}) => {
    const timerRef = useRef();
    const isLongPressTriggered = useRef(false);

    const start = useCallback((e) => {
        isLongPressTriggered.current = false;
        timerRef.current = setTimeout(() => {
            onLongPress(e);
            isLongPressTriggered.current = true;
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback((e) => {
        if (!isLongPressTriggered.current) {
            onClick(e);
        }
        clearTimeout(timerRef.current);
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: () => clearTimeout(timerRef.current),
    };
};