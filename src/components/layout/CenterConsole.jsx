import React from 'react';
import PropTypes from 'prop-types';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
// --- DEFINITIVE FIX: The redundant GroundingDisplay import is removed. ---
// import GroundingDisplay from '../ui/GroundingDisplay';
import './CenterConsole.css';

const CenterConsole = ({ selectedJoints }) => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                <MediaDisplay selectedJoints={selectedJoints} />
            </div>
            
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
                <VisualizerControlPanel />
                {/* --- DEFINITIVE FIX: The redundant GroundingDisplay has been removed. --- */}
            </div>
            
            <MasterFader /> 
        </div>
    );
};

CenterConsole.propTypes = {
    selectedJoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CenterConsole;