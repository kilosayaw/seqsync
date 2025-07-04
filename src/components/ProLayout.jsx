import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import Waveform from './Waveform';
import TopNavBar from './TopNavBar';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import './ProLayout.css';

const ProLayout = () => {
    useKeyboardControls();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <Waveform /> 
            
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
        </div>
    );
};

export default ProLayout;