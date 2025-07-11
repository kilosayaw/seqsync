import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import all context providers
import { UIStateProvider } from './context/UIStateContext';
import { MediaProvider } from './context/MediaContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { SequenceProvider } from './context/SequenceContext';
import { SoundProvider } from './context/SoundContext';
import { MotionProvider } from './context/MotionContext';

/**
 * Provider Order Justification:
 * The order of providers is crucial to ensure hooks work correctly.
 * A provider that uses a hook from another context must be nested inside that context's provider.
 *
 * 1. Independent Providers (Outer Layer): These have no dependencies on other app contexts.
 *    - MediaProvider: Manages audio/video file loading and the WaveSurfer instance.
 *    - MotionProvider: Manages live motion capture data.
 *    - UIStateProvider: Manages general UI state (panels, selections, etc.).
 *
 * 2. Dependent Providers (Middle Layers):
 *    - SequenceProvider: Depends on MediaContext (for BPM/duration) and UIStateContext (for activePad). Must be inside MediaProvider and UIStateProvider.
 *    - SoundProvider: Independent, but placed here for logical grouping with playback.
 * 
 * 3. Deeply Dependent Providers (Inner Layer):
 *    - PlaybackProvider: Depends on MediaContext (for the player instance) and SequenceContext (for bar timings). Must be inside both.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MediaProvider>
      <MotionProvider>
        <UIStateProvider>
          <SequenceProvider>
            <SoundProvider>
              <PlaybackProvider>
                <App />
              </PlaybackProvider>
            </SoundProvider>
          </SequenceProvider>
        </UIStateProvider>
      </MotionProvider>
    </MediaProvider>
  </React.StrictMode>
);