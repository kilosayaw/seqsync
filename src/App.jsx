import React, { useEffect } from 'react';
import ProLayout from './components/ProLayout';
import LoadingOverlay from './components/LoadingOverlay'; // Import the new component
import { useMedia } from './context/MediaContext';
import { useSequence } from './context/SequenceContext';
import { usePlayback } from './context/PlaybackContext';

function App() {
  const { isLoading, isMediaReady, duration, detectedBpm, audioPeaks } = useMedia(); // Get isLoading
  const { initializeSequenceFromBpm, mapWaveformToSequence } = useSequence();
  const { setBpm } = usePlayback();

  useEffect(() => {
    if (isMediaReady && detectedBpm) {
      setBpm(detectedBpm);
      const totalSteps = initializeSequenceFromBpm(duration, detectedBpm);
      if (totalSteps > 0 && audioPeaks.length > 0) {
        mapWaveformToSequence(audioPeaks);
      }
    }
  }, [isMediaReady, duration, detectedBpm, audioPeaks, setBpm, initializeSequenceFromBpm, mapWaveformToSequence]);

  return (
    <>
      <ProLayout />
      {isLoading && <LoadingOverlay />} {/* Conditionally render the overlay */}
    </>
  );
}

export default App;