// /client/src/contexts/DebugContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const DebugContext = createContext(null);

export const DebugProvider = ({ children }) => {
    const [logs, setLogs] = useState([]);

    const addLog = useCallback((message, source = 'System') => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        const newLog = `[${timestamp}] (${source}): ${message}`;
        console.log(newLog); // Also log to the actual console
        setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Keep max 100 logs
    }, []);

    const clearLogs = useCallback(() => setLogs([]), []);

    const value = { logs, addLog, clearLogs };

    return (
        <DebugContext.Provider value={value}>
            {children}
        </DebugContext.Provider>
    );
};

export const useDebugger = () => {
    const context = useContext(DebugContext);
    if (!context) {
        throw new Error('useDebugger must be used within a DebugProvider');
    }
    return context;
};