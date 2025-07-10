// src/components/ui/LevelMeter.jsx
import React, { useState, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import './LevelMeter.css';

// DEFINITIVE FIX: Renamed the component to match the file and export name.
const LevelMeter = () => {
    const { wavesurferInstance } = useMedia();
    const [level, setLevel] = useState(0);

    useEffect(() => {
        if (!wavesurferInstance) return;

        const handleAudioProcess = () => {
            // This is a simplified way to get volume. A more robust solution might use an AnalyserNode.
            const peak = wavesurferInstance.getPeaking(1.5);
            setLevel(peak * 100); // Convert to a percentage for the meter
        };

        // Set up listeners
        wavesurferInstance.on('audioprocess', handleAudioProcess);
        wavesurferInstance.on('seek', handleAudioProcess);

        // Clean up listeners when the component unmounts or wavesurferInstance changes
        return () => {
            wavesurferInstance.un('audioprocess', handleAudioProcess);
            wavesurferInstance.un('seek', handleAudioProcess);
        };
    }, [wavesurferInstance]);

    return (
        <div className="audio-levels-container">
            <div className="level-meter-wrapper">
                <div className="level-meter-bar" style={{ height: `${level}%` }}></div>
            </div>
            <span className="level-label">VOL</span>
        </div>
    );
};

export default LevelMeter;