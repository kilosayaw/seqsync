import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import ProLayout from './components/ProLayout';
import './App.css';

function App() {
  return (
    <MediaProvider>
      <SequenceProvider>
        <UIStateProvider>
          <PlaybackProvider>
            <ProLayout />
          </PlaybackProvider>
        </UIStateProvider>
      </SequenceProvider>
    </MediaProvider>
  );
}

export default App;