import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import ProLayout from './components/ProLayout';
import './App.css'; // Assuming you have an App-level stylesheet

function App() {
  console.log('[App] Rendering with Context Providers');
  return (
    // The order of providers is critical if they depend on each other.
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