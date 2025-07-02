import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MediaProvider } from './context/MediaContext';
import { SequenceProvider } from './context/SequenceContext';
import { UIStateProvider } from './context/UIStateContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { MotionProvider } from './context/MotionContext';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MediaProvider>
      <SequenceProvider>
        <UIStateProvider>
          <MotionProvider>
            <PlaybackProvider> {/* PlaybackProvider needs all others, so it's inside */}
              <App />
            </PlaybackProvider>
          </MotionProvider>
        </UIStateProvider>
      </SequenceProvider>
    </MediaProvider>
  </React.StrictMode>,
);