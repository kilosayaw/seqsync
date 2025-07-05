import React from 'react';
import CenterDisplay from './CenterDisplay';
import CrossFader from './Crossfader';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console">
            <CenterDisplay />
            <CrossFader />
        </div>
    );
};

export default CenterConsole;