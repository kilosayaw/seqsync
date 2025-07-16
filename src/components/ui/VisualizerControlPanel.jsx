import React from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import JointRoleSelector from './JointRoleSelector';
import { FaExternalLinkAlt } from 'react-icons/fa';
import './VisualizerControlPanel.css';

const VisualizerControlPanel = ({ visualizerMode, setVisualizerMode }) => {
    const { 
        activeVisualizer, setActiveVisualizer, 
        isVisualizerPoppedOut, setIsVisualizerPoppedOut, 
        activePad, selectedJoints
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
                <button 
                    className="popout-btn" 
                    title="Pop-out Visualizer"
                    onClick={() => setIsVisualizerPoppedOut(true)}
                    disabled={isVisualizerPoppedOut || activeVisualizer === 'none'}
                >
                    <FaExternalLinkAlt />
                </button>
            </div>
            
            {isEditing && (
                <div className="control-row checkbox-row">
                    <label htmlFor="face-camera-toggle" className="control-label">Face Camera:</label>
                    <input type="checkbox" id="face-camera-toggle" checked={isFacingCamera} onChange={handleFacingCameraToggle} disabled={activePad === null} />
                </div>
            )}

            <JointRoleSelector />

            {/* RESTORED: The view mode toggle button is now here, as per your design. */}
            <div className="control-row">
                 <button 
                    onClick={() => setVisualizerMode(prev => prev === 'skeleton' ? 'ribbon' : 'skeleton')}
                    className="view-toggle-btn"
                >
                    View: {visualizerMode.charAt(0).toUpperCase() + visualizerMode.slice(1)}
                </button>
            </div>
        </div>
    );
};

VisualizerControlPanel.propTypes = {
    visualizerMode: PropTypes.string.isRequired,
    setVisualizerMode: PropTypes.func.isRequired,
};

export default VisualizerControlPanel;