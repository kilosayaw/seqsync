import React from 'react';
import { FaUndo } from 'react-icons/fa';
import { useUIState } from '../../context/UIStateContext.jsx';
import './CameraQuickControls.css';

const CameraQuickControls = () => {
    const { setCameraCommand } = useUIState();

    return (
        <div className="camera-quick-controls">
            <button onClick={() => setCameraCommand('front')}>Front</button>
            <button onClick={() => setCameraCommand('rear')}>Rear</button>
            <button onClick={() => setCameraCommand('left')}>Left</button>
            <button onClick={() => setCameraCommand('right')}>Right</button>
            <button onClick={() => setCameraCommand('reset')} title="Reset View"><FaUndo /></button>
        </div>
    );
};

export default CameraQuickControls;