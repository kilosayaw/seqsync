import React from 'react';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import CenterConsole from './CenterConsole';
import LeftDeck from './LeftDeck';
import RightDeck from './RightDeck';
import { useMedia } from '../../context/MediaContext';
import LoadingOverlay from '../ui/LoadingOverlay';
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
            {isLoading && <LoadingOverlay />}
        </div>
    );
};

export default ProLayout;