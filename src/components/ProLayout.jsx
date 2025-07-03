import React from 'react';
import Deck from './Deck.jsx';
import CenterConsole from './CenterConsole.jsx';
import WaveformNavigator from './WaveformNavigator.jsx';
import NotationDisplay from './NotationDisplay.jsx';
import TopNavBar from './TopNavBar.jsx';
import LoadingOverlay from './LoadingOverlay.jsx'; // Make sure this path is correct
import { useMedia } from '../context/MediaContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls.js';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();
    useKeyboardControls();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <div className="top-section-wrapper">
                <WaveformNavigator />
                <NotationDisplay />
            </div>
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
            {isLoading && <LoadingOverlay />}
        </div>
    );
};
export default ProLayout;