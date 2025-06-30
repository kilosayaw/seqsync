import React, { useEffect } from 'react';
import ProLayout from './components/ProLayout';
import { useMedia } from './context/MediaContext';
import { useSequence } from './context/SequenceContext';
import { usePlayback } from './context/PlaybackContext';
import { useUIState } from './context/UIStateContext'; // Import UIStateContext

function App() {
  const { isMediaReady, duration, detectedBpm } = useMedia();
  const { initializeSequenceFromBpm, updateBeatData } = useSequence(); // Get update function
  const { setBpm, isRecording, currentBeat } = usePlayback();
  const { selectedBar } = useUIState();

  // This effect orchestrates loading a new track
  useEffect(() => {
    if (isMediaReady && detectedBpm) {
      setBpm(detectedBpm);
      initializeSequenceFromBpm(duration, detectedBpm);
    }
  }, [isMediaReady, duration, detectedBpm, setBpm, initializeSequenceFromBpm]);


  // THIS IS THE NEW RECORDING LOGIC
  // We need to access livePoseData here, so we will pass it down from CameraFeed later
  // For now, this structure is ready. Let's get livePoseData into a context.

  return <ProLayout />;
}

export default App;