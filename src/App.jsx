// src/App.jsx
import React from 'react';
import { SequenceProvider } from './context/SequenceContext';
import { MediaProvider } from './context/MediaContext';
import { SoundProvider } from './context/SoundContext';
import ProLayout from './components/layout/ProLayout';
import './App.css';

function App() {
  return (
    <SoundProvider>
      <SequenceProvider>
        <MediaProvider>
          <ProLayout />
        </MediaProvider>
      </SequenceProvider>
    </SoundProvider>
  );
}
export default App;