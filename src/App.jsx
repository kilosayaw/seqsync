import React, { useEffect } from 'react';
import ProLayout from './components/ProLayout';
import { useMedia } from './context/MediaContext';
import { usePlayback } from './context/PlaybackContext';

function App() {
    const { isMediaReady, mediaUrl, detectedBpm } = useMedia();
    const { initializeEngine } = usePlayback();

    useEffect(() => {
        if (isMediaReady && mediaUrl) {
            console.log(`[App] Media ready. Initializing engine with BPM: ${detectedBpm}`);
            initializeEngine(mediaUrl, detectedBpm);
        }
    }, [isMediaReady, mediaUrl, detectedBpm, initializeEngine]);

    return <ProLayout />;
}

export default App;