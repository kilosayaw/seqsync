// src/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from './components/common/ErrorBoundary';
import StepSequencerControls from './components/core/sequencer/StepSequencerControls';
function App() {
  return (
    <ErrorBoundary>
      <StepSequencerControls />
    </ErrorBoundary>
  );
}

export default App;