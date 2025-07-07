// src/App.jsx

import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext';
import { SoundProvider } from './context/SoundContext'; // IMPORT NEW PROVIDER
import ProLayout from './components/layout/ProLayout';
import './App.css';

function App() {
  return (
    <MediaProvider>
      <SequenceProvider>
        <UIStateProvider>
          <PlaybackProvider>
            <MotionProvider>
              {/* WRAP with SoundProvider */}
              <SoundProvider>
                <ProLayout />
              </SoundProvider>
            </MotionProvider>
          </PlaybackProvider>
        </UIStateProvider>
      </SequenceProvider>
    </MediaProvider>
  );
}

export default App;