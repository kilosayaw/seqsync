import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import JointRoleSelector from './JointRoleSelector';
import { FaExternalLinkAlt } from 'react-icons/fa'; // Icon for the pop-out button
import './VisualizerControlPanel.css';

const VisualizerControlPanel = () => {
    // Get all necessary state from the UI context, including for the pop-out window
    const { 
        activeVisualizer, 
        setActiveVisualizer, 
        isVisualizerPoppedOut, 
        setIsVisualizerPoppedOut, 
        activePad, 
        selectedJoints 
    } = useUIState();
    
    const { songData, updateBeatMetaData } = useSequence();

    const isEditing = selectedJoints.length > 0;
    const isFacingCamera = activePad !== null && songData[activePad]?.meta?.isFacingCamera === true;

    const handleFacingCameraToggle = () => {
        if (activePad !== null) {
            updateBeatMetaData(activePad, { isFacingCamera: !isFacingCamera });
        }
    };

    return (
        <div className="visualizer-control-panel">
            <div className="control-row">
                <label htmlFor="viz-select" className="control-label">Visualizer:</label>
                <select 
                    id="viz-select"
                    value={activeVisualizer} 
                    onChange={(e) => setActiveVisualizer(e.target.value)}
                    className="control-select"
                >
                    <option value="none">Off</option>
                    <option value="full">Full Skeleton</option>
                    <option value="core">Core Body</option>
                </select>
                
                {/* DEFINITIVE: The Pop Out button is now correctly integrated here. */}
                <button 
                    className="popout-btn" 
                    title="Pop-out Visualizer"
                    onClick={() => setIsVisualizerPoppedOut(true)}
                    // Disable the button if a window is already open or if no visualizer is active
                    disabled={isVisualizerPoppedOut || activeVisualizer === 'none'}
                >
                    <FaExternalLinkAlt />
                </button>
            </div>
            
            {/* The conditional "Face Camera" toggle remains unchanged. */}
            {isEditing && (
                <div className="control-row checkbox-row">
                    <label htmlFor="face-camera-toggle" className="control-label">Face Camera:</label>
                    <input
                        type="checkbox"
                        id="face-camera-toggle"
                        checked={isFacingCamera}
                        onChange={handleFacingCameraToggle}
                        disabled={activePad === null}
                    />
                </div>
            )}

            {/* The JointRoleSelector remains unchanged. */}
            <JointRoleSelector />
        </div>
    );
};

export default VisualizerControlPanel;