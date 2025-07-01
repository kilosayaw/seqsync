import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import WaveformNavigator from './WaveformNavigator';
import NotationDisplay from './NotationDisplay';
import TopNavBar from './TopNavBar';
import PoseEditorModal from './PoseEditorModal';
import LoadingOverlay from './LoadingOverlay';
import { useUIState } from '../context/UIStateContext';
import { useMedia } from '../context/MediaContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import './ProLayout.css';

const ProLayout = () => {
    const { isPoseEditorOpen } = useUIState();
    const { isLoading } = useMedia();
    useKeyboardControls();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
            {isPoseEditorOpen && <PoseEditorModal />}
            {isLoading && <LoadingOverlay />}
        </div>
    );
};

export default ProLayout;