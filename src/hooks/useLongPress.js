// src/hooks/useLongPress.js

import { useCallback, useRef } from 'react';

export const useLongPress = (
    onClick,
    onLongPress,
    { ms = 400 } = {}
) => {
    const timerRef = useRef();
    const isLongPressTriggered = useRef(false);

    const start = useCallback((event) => {
        isLongPressTriggered.current = false;
        event.persist();
        timerRef.current = setTimeout(() => {
            onLongPress(event);
            isLongPressTriggered.current = true;
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback((event) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        if (!isLongPressTriggered.current) {
            onClick(event);
        }
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: () => clearTimeout(timerRef.current),
        onTouchStart: start,
        onTouchEnd: clear,
    };
};