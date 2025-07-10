// src/components/ui/VisualizerControlPanel.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import JointRoleSelector from './JointRoleSelector';
import './VisualizerControlPanel.css';

const VisualizerControlPanel = () => {
    const { activeVisualizer, setActiveVisualizer } = useUIState();

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
            <JointRoleSelector />
        </div>
    );
};

export default VisualizerControlPanel;