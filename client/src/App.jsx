// src/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
// AuthProvider and SequencerSettingsProvider are correctly placed in main.jsx

function App() {
  // This component's primary role is now just to provide the RouterProvider
  // if all contexts are handled in main.jsx.
  return (
    <RouterProvider router={router} />
  );
}

export default App;