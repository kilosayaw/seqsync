import React, { useEffect } from 'react';
import ProLayout from './components/layout/ProLayout';
import { themes } from './styles/themes';
import './App.css';

const App = () => {
  // Set the default theme on initial load
  useEffect(() => {
    const theme = themes['tr-808']; // Default to 'tr-808' theme
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, []);

  return (
    <div className="app-container">
      <ProLayout />
    </div>
  );
};

export default App;