// src/components/layout/CenterConsole.jsx
import React, { useRef, useState, useEffect } from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import MediaDisplay from '../media/MediaDisplay';
import VisualizerControlPanel from '../ui/VisualizerControlPanel'; // DEFINITIVE: Import new component
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
                {/* DEFINITIVE: Replace JointRoleSelector with the new control panel */}
                <VisualizerControlPanel />
            </div>
            <Crossfader />
        </div>
    );
};
export default CenterConsole;