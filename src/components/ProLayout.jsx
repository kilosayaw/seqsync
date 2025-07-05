// src/components/ProLayout.jsx
import React from 'react';
import TopNavBar from './TopNavBar';
import WaveformNavigator from './WaveformNavigator';
import NotationDisplay from './NotationDisplay';
import CenterConsole from './CenterConsole';
import Deck from './Deck'; // Deck is the entire side now
import { useMedia } from '../context/MediaContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <main className="main-content-area">
                <Deck deckId="deck1" side="left" />
                <CenterConsole />
                <Deck deckId="deck2" side="right" />
            </main>
            {isLoading && <div className="loading-overlay"><h1>ANALYZING...</h1></div>}
        </div>
    );
};

export default ProLayout;