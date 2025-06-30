import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import WaveformNavigator from './WaveformNavigator'; // Use the new interactive navigator
import NotationDisplay from './NotationDisplay';
import TopNavBar from './TopNavBar';
import PoseEditorModal from './PoseEditorModal';
import { useUIState } from '../context/UIStateContext';
import './ProLayout.css';

const ProLayout = () => {
    const { isPoseEditorOpen } = useUIState();

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            
            {/* KEY CHANGE: The old MasterSequencer is replaced with the new WaveformNavigator */}
            <WaveformNavigator />

            <NotationDisplay />
            
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
            
            {/* The PoseEditorModal is still here and will work as intended */}
            {isPoseEditorOpen && <PoseEditorModal />}
        </div>
    );
};

export default ProLayout;