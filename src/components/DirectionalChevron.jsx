    import React from 'react';
import './DirectionalChevron.css';

const DirectionalChevron = ({ move, jointId }) => {
    return (
        <div className="directional-chevron-container">
            <div className="chevron-symbol">{move}</div>
            <div className="chevron-joint">{jointId}</div>
        </div>
    );
};

export default DirectionalChevron;