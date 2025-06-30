import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { MediaProvider } from './context/MediaContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { UIStateProvider } from './context/UIStateContext';
import { SequenceProvider } from './context/SequenceContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MediaProvider>
      <SequenceProvider>
        <PlaybackProvider>
          <UIStateProvider>
            <App />
          </UIStateProvider>
        </PlaybackProvider>
      </SequenceProvider>
    </MediaProvider>
  </React.StrictMode>,
);