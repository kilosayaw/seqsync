// /client/src/components/common/DebugPanel.jsx
import React from 'react';
import { useDebugger } from '../../contexts/DebugContext.jsx';

const DebugPanel = () => {
    const { logs, clearLogs } = useDebugger();

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '400px',
            height: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', backgroundColor: '#222' }}>
                <span>SĒQsync Debug Log</span>
                <button onClick={clearLogs} style={{ background: 'none', border: '1px solid #444', color: '#f00', cursor: 'pointer' }}>
                    Clear
                </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px', display: 'flex', flexDirection: 'column-reverse' }}>
                <div>
                    {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DebugPanel;