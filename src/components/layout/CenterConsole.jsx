import React from 'react';
import PropTypes from 'prop-types';
import BarBeatDisplay from '../ui/BarBeatDisplay.jsx';
import TransportControls from '../ui/TransportControls.jsx';
import MasterFader from '../ui/MasterFader.jsx';
import MediaDisplay from '../media/MediaDisplay.jsx';
import VisualizerControlPanel from '../ui/VisualizerControlPanel.jsx';
import './CenterConsole.css';

const CenterConsole = ({ selectedJoints, barBeatDisplayProps }) => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                <MediaDisplay selectedJoints={selectedJoints} />
            </div>
            <div className="center-controls-group">
                <BarBeatDisplay {...barBeatDisplayProps} />
                <TransportControls />
                <VisualizerControlPanel />
            </div>
            <MasterFader /> 
        </div>
    );
};

CenterConsole.propTypes = {
    selectedJoints: PropTypes.arrayOf(PropTypes.string).isRequired,
    barBeatDisplayProps: PropTypes.object.isRequired,
};

export default CenterConsole;