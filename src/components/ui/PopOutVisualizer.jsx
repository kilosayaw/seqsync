import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import NewWindow from 'react-new-window';
import { useUIState } from '../../context/UIStateContext';

const PopOutVisualizer = ({ children }) => {
    const { setIsVisualizerPoppedOut } = useUIState();
    const [popoutBody, setPopoutBody] = useState(null);

    const onOpen = (newWindow) => {
        newWindow.document.title = 'SĒQsync Visualizer';
        newWindow.document.body.style.margin = '0';
        newWindow.document.body.style.background = '#000';
        newWindow.document.body.style.overflow = 'hidden';
        setPopoutBody(newWindow.document.body);
    };

    return (
        <NewWindow
            onOpen={onOpen}
            onUnload={() => setIsVisualizerPoppedOut(false)}
            features={{ width: 600, height: 600 }}
            copyStyles={false}
        >
            {popoutBody && ReactDOM.createPortal(children, popoutBody)}
        </NewWindow>
    );
};

export default PopOutVisualizer;