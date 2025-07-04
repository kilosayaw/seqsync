import React from 'react';
import CenterDisplay from './CenterDisplay';
import Crossfader from './Crossfader';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console">
            <CenterDisplay />
            <Crossfader />
        </div>
    );
};

export default CenterConsole;