import React from 'react';
import PropTypes from 'prop-types';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
import JointEditModeToggle from '../ui/JointEditModeToggle';
import './CenterConsole.css';

const CenterConsole = ({ visualizerMode, setVisualizerMode }) => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                <MediaDisplay visualizerMode={visualizerMode} />
            </div>
            
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
                {/* RESTORED: Passes both props to the control panel */}
                <VisualizerControlPanel 
                    visualizerMode={visualizerMode} 
                    setVisualizerMode={setVisualizerMode} 
                />
                <JointEditModeToggle />
            </div>
            
            <MasterFader /> 
        </div>
    );
};

CenterConsole.propTypes = {
    visualizerMode: PropTypes.string.isRequired,
    setVisualizerMode: PropTypes.func.isRequired,
};

export default CenterConsole;