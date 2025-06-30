import React from 'react';
import ProLayout from './components/ProLayout';
// We are keeping our main app CSS in case we need it for global styles
import './App.css';

function App() {
  // All the old layout logic is removed.
  // We simply render our new ProLayout component.
  // The Context Providers in main.jsx will still wrap this,
  // making the state available when we need it.
  return (
    <ProLayout />
  );
}

export default App;