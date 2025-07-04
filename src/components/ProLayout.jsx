import React from 'react';
import TopNavBar from './TopNavBar';
import WaveformNavigator from './WaveformNavigator';
import NotationDisplay from './NotationDisplay';
import CenterConsole from './CenterConsole';
import Deck from './Deck';
import { useMedia } from '../context/MediaContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <div className="top-section-container">
                <WaveformNavigator />
                <NotationDisplay />
            </div>
            <div className="main-content-area">
                <Deck deckId="deck1" />
                <CenterConsole />
                <Deck deckId="deck2" />
            </div>
            {isLoading && <div className="loading-overlay"><h1>ANALYZING...</h1></div>}
        </div>
    );
};

export default ProLayout;