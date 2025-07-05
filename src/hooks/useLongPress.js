// src/hooks/useLongPress.js
import { useCallback, useRef } from 'react';

// A simple, effective long-press hook.
export const useLongPress = (
    onClick,
    onLongPress,
    { ms = 400 } = {} // Default long-press duration is 400ms
) => {
    const timerRef = useRef();
    const isLongPressTriggered = useRef(false);

    const start = useCallback((event) => {
        isLongPressTriggered.current = false;
        event.persist(); // Persist the event for the async timeout
        timerRef.current = setTimeout(() => {
            onLongPress(event);
            isLongPressTriggered.current = true;
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback((event) => {
        if (!isLongPressTriggered.current) {
            // If the timer didn't fire, it's a regular click.
            onClick(event);
        }
        clearTimeout(timerRef.current);
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: () => clearTimeout(timerRef.current),
    };
};