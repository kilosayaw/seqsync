import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import MasterSequencer from './MasterSequencer';
import NotationDisplay from './NotationDisplay';
import TopNavBar from './TopNavBar'; // Import the new component
import PoseEditorModal from './PoseEditorModal'; // Import the new modal
import { useUIState } from '../context/UIStateContext'; // Import context to control modal
import './ProLayout.css';

const ProLayout = () => {
    const { isPoseEditorOpen } = useUIState();

    return (
        <div className="pro-layout-container">
            <TopNavBar /> {/* Add the new nav bar */}
            <MasterSequencer />
            <NotationDisplay />
            <div className="main-content-area">
                <Deck side="left" />
                <CenterConsole />
                <Deck side="right" />
            </div>
            {isPoseEditorOpen && <PoseEditorModal />} {/* Conditionally render modal */}
        </div>
    );
};

export default ProLayout;