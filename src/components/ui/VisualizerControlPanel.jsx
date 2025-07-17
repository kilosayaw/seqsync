import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { FaExternalLinkAlt } from 'react-icons/fa';
// --- REMOVED ---
// The JointRoleSelector is no longer needed or imported.
// import JointRoleSelector from './JointRoleSelector'; 
import './VisualizerControlPanel.css';

const VisualizerControlPanel = () => {
    const { 
        activeVisualizer, setActiveVisualizer, 
        isVisualizerPoppedOut, setIsVisualizerPoppedOut, 
    } = useUIState();
    
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
            
            {/* --- REMOVED --- */}
            {/* The "Face Camera" checkbox and the JointRoleSelector component */}
            {/* have been completely removed from the render output. */}
            {/* --- END REMOVED --- */}
        </div>
    );
};

export default VisualizerControlPanel;