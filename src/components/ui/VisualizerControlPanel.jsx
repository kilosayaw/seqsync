import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import JointRoleSelector from './JointRoleSelector';
import './VisualizerControlPanel.css';

const VisualizerControlPanel = () => {
    // DEFINITIVE: Destructure selectedJoints to control UI visibility
    const { activeVisualizer, setActiveVisualizer, activePad, selectedJoints } = useUIState();
    const { songData, updateBeatMetaData } = useSequence();

    // The condition for being in "joint edit mode"
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
            </div>
            
            {/* DEFINITIVE FIX: The "Face Camera" toggle is now only rendered when a joint is selected. */}
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

            {/* The JointRoleSelector already correctly depends on selectedJoints */}
            <JointRoleSelector />
        </div>
    );
};

export default VisualizerControlPanel;