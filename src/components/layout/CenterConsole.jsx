import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
import JointEditModeToggle from '../ui/JointEditModeToggle'; // PHOENIX PROTOCOL: Import new component
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                <MediaDisplay />
            </div>
            
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
                <VisualizerControlPanel />
                {/* PHOENIX PROTOCOL: Add new component to the UI */}
                <JointEditModeToggle />
            </div>
            
            <MasterFader /> 
        </div>
    );
};

export default CenterConsole;