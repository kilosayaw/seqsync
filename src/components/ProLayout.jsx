import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import MasterSequencer from './MasterSequencer';
import NotationDisplay from './NotationDisplay'; // Import the new component
import './ProLayout.css';

const ProLayout = () => {
    return (
        <div className="pro-layout-container">
            <MasterSequencer />
            <NotationDisplay /> {/* Add the new component here */}
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
        </div>
    );
};

export default ProLayout;