import React, { useEffect } from 'react';
import ProLayout from './components/ProLayout';
import LoadingOverlay from './components/LoadingOverlay';
import { useMedia } from './context/MediaContext';
import { useSequence } from './context/SequenceContext';
import { usePlayback } from './context/PlaybackContext';
import { useKeyboardControls } from './hooks/useKeyboardControls';

function App() {
  const { isLoading, isMediaReady, duration, detectedBpm, audioPeaks } = useMedia();
  const { initializeSequenceFromBpm, mapWaveformToSequence } = useSequence();
  const { setBpm } = usePlayback();
  
  useKeyboardControls(); // Activate the global keyboard listener

  useEffect(() => {
    if (isMediaReady && detectedBpm) {
      setBpm(detectedBpm);
      const totalSteps = initializeSequenceFromBpm(duration, detectedBpm);
      if (totalSteps > 0 && audioPeaks.length > 0) mapWaveformToSequence(audioPeaks);
    }
  }, [isMediaReady, duration, detectedBpm, audioPeaks]);

  return (
    <>
      <ProLayout />
      {isLoading && <LoadingOverlay />}
    </>
  );
}

export default App;