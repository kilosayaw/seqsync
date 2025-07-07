// src/components/layout/ProLayout.jsx

import React from 'react';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import CenterConsole from './CenterConsole';
import LeftDeck from './LeftDeck';   // We will create this component
import RightDeck from './RightDeck'; // We will create this component
import { useMedia } from '../../context/MediaContext';
import LoadingOverlay from '../ui/LoadingOverlay'; // Import the dedicated component
import './ProLayout.css';

const ProLayout = () => {
    const { isLoading } = useMedia();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck />
                <CenterConsole />
                <RightDeck />
            </main>
            {/* Use the dedicated LoadingOverlay component */}
            {isLoading && <LoadingOverlay />}
        </div>
    );
};

export default ProLayout;