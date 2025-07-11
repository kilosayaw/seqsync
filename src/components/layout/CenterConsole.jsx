import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader'; // PHOENIX PROTOCOL: Renamed for clarity.
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
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
            </div>
            {/* PHOENIX PROTOCOL: Renamed for clarity. */}
            <MasterFader /> 
        </div>
    );
};
export default CenterConsole;