import React from 'react';
import './LevelMeter.css';

// A utility to convert dB level to a percentage height for the bar
const dbToPercent = (db) => {
    if (db < -60) return 0;
    if (db > 0) return 100;
    return 100 * (1 + db / 60);
};

const LevelMeter = ({ level = -Infinity }) => {
    const heightPercent = dbToPercent(level);

    return (
        <div className="level-meter-container">
            <div className="level-meter-track">
                <div 
                    className="level-meter-bar" 
                    style={{ height: `${heightPercent}%` }}
                />
            </div>
        </div>
    );
};

export default LevelMeter;