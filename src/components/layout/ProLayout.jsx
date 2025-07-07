// src/components/layout/ProLayout.jsx
import React, { useCallback } from 'react';
import TopNavBar from '../ui/TopNavBar';
import WaveformNavigator from '../ui/WaveformNavigator';
import NotationDisplay from '../ui/NotationDisplay';
import CenterConsole from './CenterConsole';
import LeftDeck from './LeftDeck';
import RightDeck from './RightDeck';
import { useMedia } from '../../context/MediaContext';
import LoadingOverlay from '../ui/LoadingOverlay';
import { useKeyboardControls } from '../../hooks/useKeyboardControls'; // Import keyboard hook
import './ProLayout.css';

// Define placeholder handlers at a higher scope
// These will be replaced by the actual handlers inside the component
let leftDeckPadClickHandler = () => {};
let rightDeckPadClickHandler = () => {};

const ProLayout = () => {
    const { isLoading } = useMedia();

    // The useKeyboardControls hook needs stable function references.
    // We create a way to update the handlers it calls without re-running the hook itself.
    const setLeftDeckHandler = (handler) => {
        leftDeckPadClickHandler = handler;
    };
    const setRightDeckHandler = (handler) => {
        rightDeckPadClickHandler = handler;
    };

    // The hook is called once with stable proxy functions
    useKeyboardControls(
        (index) => leftDeckPadClickHandler(index),
        (index) => rightDeckPadClickHandler(index)
    );

    return (
        <div className="pro-layout-container">
            <TopNavBar />
            <WaveformNavigator />
            <NotationDisplay />
            <main className="main-content-area">
                <LeftDeck setPadClickHandler={setLeftDeckHandler} />
                <CenterConsole />
                <RightDeck setPadClickHandler={setRightDeckHandler} />
            </main>
            {isLoading && <LoadingOverlay />}
        </div>
    );
};
export default ProLayout;