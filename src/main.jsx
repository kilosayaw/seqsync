import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import all context providers
import { MediaProvider } from './context/MediaContext.jsx';
import { SequenceProvider } from './context/SequenceContext.jsx';
import { UIStateProvider } from './context/UIStateContext.jsx';
import { PlaybackProvider } from './context/PlaybackContext.jsx';
import { MotionProvider } from './context/MotionContext.jsx'; // Assuming this exists from error log

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 
      CORRECTED PROVIDER HIERARCHY:
      Providers with no dependencies are on the outside.
      Providers that consume other contexts are nested inside.
      PlaybackProvider needs UIState and Sequence, so it must be inside them.
    */}
    <MediaProvider>
      <SequenceProvider>
        <UIStateProvider>
          <MotionProvider>
            <PlaybackProvider>
              <App />
            </PlaybackProvider>
          </MotionProvider>
        </UIStateProvider>
      </SequenceProvider>
    </MediaProvider>
  </React.StrictMode>,
)