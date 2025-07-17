import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
// --- DEFINITIVE FIX: The incorrect import is removed. ---
// import GroundingDisplay from '../ui/GroundingDisplay'; 
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
                {/* --- DEFINITIVE FIX: The redundant component is removed from the layout. --- */}
                {/* The correct GroundingDisplay is inside MediaDisplay.jsx */}
            </div>
            
            <MasterFader /> 
        </div>
    );
};

CenterConsole.propTypes = {};

export default CenterConsole;