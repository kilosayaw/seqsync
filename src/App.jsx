import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext';
import { SoundProvider } from './context/SoundContext';
import ProLayout from './components/layout/ProLayout';
import './App.css';

function App() {
  return (
    // DEFINITIVE FIX: Re-ordered providers to resolve the dependency error.
    // UIStateProvider must be a parent of SequenceProvider because SequenceProvider now uses the useUIState hook.
    <MediaProvider>
      <UIStateProvider>
        <SequenceProvider>
          <PlaybackProvider>
            <MotionProvider>
              <SoundProvider>
                <ProLayout />
              </SoundProvider>
            </MotionProvider>
          </PlaybackProvider>
        </SequenceProvider>
      </UIStateProvider>
    </MediaProvider>
  );
}

export default App;