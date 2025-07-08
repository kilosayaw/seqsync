// src/hooks/useLongPress.js
import { useCallback, useRef, useEffect } from 'react';

export const useLongPress = (
    onClick,
    onLongPress,
    { ms = 400 } = {}
) => {
    const timerRef = useRef();
    const isLongPressTriggered = useRef(false);

    const start = useCallback((event) => {
        isLongPressTriggered.current = false;
        // For touch events, we need to prevent default to avoid scrolling
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
        timerRef.current = setTimeout(() => {
            onLongPress(event);
            isLongPressTriggered.current = true;
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback((event) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        // Only fire the short click if a long press hasn't happened
        if (!isLongPressTriggered.current) {
            onClick(event);
        }
    }, [onClick]);
    
    // Add an explicit cleanup for the timer
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: () => clearTimeout(timerRef.current),
        onTouchStart: start,
        onTouchEnd: clear,
    };
};