import React from 'react';
import PropTypes from 'prop-types';
import BarBeatDisplay from '../ui/BarBeatDisplay'; // TYPO FIXED: Corrected 'Дisplay' to 'Display'
import TransportControls from '../ui/TransportControls';
import MasterFader from '../ui/MasterFader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel';
import JointEditModeToggle from '../ui/JointEditModeToggle';
import './CenterConsole.css';

// The component now accepts props from the parent layout
const CenterConsole = ({ visualizerMode, setVisualizerMode }) => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                {/* Passes the visualizerMode prop down to the MediaDisplay */}
                <MediaDisplay visualizerMode={visualizerMode} />
            </div>
            
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
                {/* Passes both props to the control panel */}
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

// PropTypes are added for validation and bug prevention
CenterConsole.propTypes = {
    visualizerMode: PropTypes.string.isRequired,
    setVisualizerMode: PropTypes.func.isRequired,
};

export default CenterConsole;