// src/App.jsx

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
    // DEFINITIVE FIX: The providers are now nested in the correct order of dependency.
    // A provider on the "outside" makes its context available to all providers and
    // components nested on the "inside".
    <UIStateProvider>
      <SequenceProvider>
        <MediaProvider>
          <PlaybackProvider>
            <MotionProvider>
              <SoundProvider>
                <ProLayout />
              </SoundProvider>
            </MotionProvider>
          </PlaybackProvider>
        </MediaProvider>
      </SequenceProvider>
    </UIStateProvider>
  );
}

export default App;