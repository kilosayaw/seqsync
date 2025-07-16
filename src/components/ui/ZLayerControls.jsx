// src/components/ui/ZLayerControls.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './ZLayerControls.css';

const ZLayerControls = ({ onZLayerClick, activeZ }) => {
    
    const handleLayerClick = (zValue) => {
        if (!onZLayerClick) return;
        // This component only deals with the Z value.
        onZLayerClick({ z: zValue });
    };

    return (
        <div className="z-layer-controls-container">
            <button 
                className={classNames('z-layer-btn', { active: activeZ === 1 })} 
                onClick={() => handleLayerClick(1)}
            >
                Front
            </button>
            <button 
                className={classNames('z-layer-btn', { active: activeZ === 0 })} 
                onClick={() => handleLayerClick(0)}
            >
                Center
            </button>
            <button 
                className={classNames('z-layer-btn', { active: activeZ === -1 })} 
                onClick={() => handleLayerClick(-1)}
            >
                Back
            </button>
        </div>
    );
};

ZLayerControls.propTypes = {
    onZLayerClick: PropTypes.func.isRequired,
    activeZ: PropTypes.number,
};

export default ZLayerControls;