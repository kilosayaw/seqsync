import React from 'react';
import TopNavBar from './TopNavBar';
import CenterConsole from './CenterConsole';
import Deck from './Deck';
import WaveformNavigator from './WaveformNavigator';
import NotationDisplay from './NotationDisplay';
import PitchSlider from './PitchSlider';
import DeckJointList from './DeckJointList';
import { useMedia } from '../context/MediaContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <div className="main-content-area">
                <PitchSlider side="left" />
                {/* CORE FIX: The 'side' prop is now correctly passed to each Deck */}
                <Deck deckId="deck1" side="left" />
                <DeckJointList side="left" />
                <CenterConsole />
                <DeckJointList side="right" />
                <Deck deckId="deck2" side="right" />
                <PitchSlider side="right" />
            </div>
            {isLoading && <div className="loading-overlay"><h1>ANALYZING...</h1></div>}
        </div>
    );
};

export default ProLayout;