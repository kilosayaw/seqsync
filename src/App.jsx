import React, { useEffect } from 'react';
import { MediaProvider, useMedia } from './context/MediaContext';
import { SequenceProvider, useSequence } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext';
import ProLayout from './components/ProLayout';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

// This is the core orchestrator component
function App() {
  const { isLoading, isMediaReady, detectedBpm, duration } = useMedia();
  const { initializeSequenceFromBpm } = useSequence();

  // This effect orchestrates the creation of the sequence structure
  // once the media has been analyzed.
  useEffect(() => {
    // The check for isMediaReady prevents this from running on initial load.
    // It will only run AFTER a file is loaded and processed.
    if (isMediaReady && detectedBpm && duration) {
      console.log(`[App.jsx] Media is ready. Initializing sequence with Duration: ${duration}s, BPM: ${detectedBpm}`);
      initializeSequenceFromBpm(duration, detectedBpm);
      // The call to mapWaveformToSequence is REMOVED as it is now obsolete.
    }
  }, [isMediaReady, detectedBpm, duration, initializeSequenceFromBpm]);


  return (
    <>
      {isLoading && <LoadingOverlay />}
      <ProLayout />
    </>
  );
}

// This is the main entry point where all providers are wrapped.
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