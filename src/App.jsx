import React, { useEffect } from 'react';
import { MediaProvider, useMedia } from './context/MediaContext';
import { SequenceProvider, useSequence } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext';
import ProLayout from './components/ProLayout';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function App() {
  const { isLoading, isMediaReady, detectedBpm, duration } = useMedia();
  const { initializeSequenceFromBpm } = useSequence();

  useEffect(() => {
    if (isMediaReady && detectedBpm && duration) {
      console.log(`[App.jsx] Media is ready. Initializing sequence with Duration: ${duration}s, BPM: ${detectedBpm}`);
      initializeSequenceFromBpm(duration, detectedBpm);
    }
  }, [isMediaReady, detectedBpm, duration, initializeSequenceFromBpm]);


  return (
    <>
      {isLoading && <LoadingOverlay />}
      <ProLayout />
    </>
  );
}

const AppWrapper = () => (
  <MediaProvider>
    <SequenceProvider>
      <UIStateProvider>
        <MotionProvider>
          <PlaybackProvider>
            <App />
          </PlaybackProvider>
        </MotionProvider>
      </UIStateProvider>
    </SequenceProvider>
  </MediaProvider>
);

export default AppWrapper;