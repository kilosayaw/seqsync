// client/src/hooks/useActionLogger.js
import { useCallback } from 'react';

// MASTER SWITCH: Set this to `false` to disable all action logs for production
const LOGGING_ENABLED = process.env.NODE_ENV === 'development';

const getTimestamp = () => {
    const now = new Date();
    return `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

export const useActionLogger = (componentName = 'Component') => {
  const logAction = useCallback((actionType, payload = {}) => {
    if (!LOGGING_ENABLED) {
      return;
    }

    const timestamp = getTimestamp();
    const groupTitle = `%c[${timestamp}] Action: %c${actionType} %c@ ${componentName}`;
    
    const styleHeader = 'color: #94a3b8; font-weight: bold;'; // Tailwind gray-400
    const styleAction = 'color: #f59e0b; font-weight: bold;'; // Tailwind amber-500
    const styleComponent = 'color: #60a5fa;'; // Tailwind blue-400

    console.groupCollapsed(groupTitle, styleHeader, styleAction, styleComponent);
    console.log('%cPayload:', 'color: #a78bfa; font-weight: bold', payload); // Tailwind violet-400
    console.groupEnd();

  }, [componentName]);

  return logAction;
};