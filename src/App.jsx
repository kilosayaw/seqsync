import React, { useEffect, useRef } from 'react';
import ProLayout from './components/ProLayout';
import { useMedia } from './context/MediaContext';
import { usePlayback } from './context/PlaybackContext';
import { useSequence } from './context/SequenceContext';

function App() {
    const { isMediaReady, duration, detectedBpm, mediaUrl } = useMedia();
    const { initializeEngine } = usePlayback();
    const { initializeSequenceFromBpm } = useSequence();

    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (isMediaReady && mediaUrl && !hasInitializedRef.current) {
            console.log(`[App] ✅ Media is ready. Orchestrating system update...`);
            hasInitializedRef.current = true;
            
            initializeSequenceFromBpm(duration, detectedBpm);
            initializeEngine(mediaUrl, detectedBpm);
        }
        if (!isMediaReady) {
            hasInitializedRef.current = false;
        }
    }, [isMediaReady, mediaUrl, duration, detectedBpm, initializeEngine, initializeSequenceFromBpm]);

    return <ProLayout />;
}

export default App;