import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext'; // Added for future motion analysis
import ProLayout from './components/layout/ProLayout'; // Updated path
import './App.css';

function App() {
  return (
    <MediaProvider>
      <SequenceProvider>
        <UIStateProvider>
          <PlaybackProvider>
            <MotionProvider>
              <ProLayout />
            </MotionProvider>
          </PlaybackProvider>
        </UIStateProvider>
      </SequenceProvider>
    </MediaProvider>
  );
}

export default App;