// src/components/ui/DirectionalControls.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './DirectionalControls.css';

const DirectionalControls = () => {
    const { activeDirection, setActiveDirection } = useUIState();

    const handleClick = (direction) => {
        console.log(`[Direction] Set to: ${direction}`);
        setActiveDirection(direction);
    };

    return (
        <div className="directional-controls-container">
            <button className={classNames('dir-btn', {active: activeDirection === 'up_down'})} onClick={() => handleClick('up_down')}>UP/DOWN</button>
            <button className={classNames('dir-btn', {active: activeDirection === 'l_r'})} onClick={() => handleClick('l_r')}>LEFT/RIGHT</button>
            <button className={classNames('dir-btn', {active: activeDirection === 'fwd_bwd'})} onClick={() => handleClick('fwd_bwd')}>FWD/BACK</button>
        </div>
    );
};
export default DirectionalControls;