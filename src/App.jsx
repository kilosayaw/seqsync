// src/App.jsx
import React, { useEffect } from 'react';
import { SequenceProvider, useSequence } from './context/SequenceContext';
import { MediaProvider } from './context/MediaContext';
import { SoundProvider } from './context/SoundContext';
import ProLayout from './components/layout/ProLayout';
import { themes } from './styles/themes';
import './App.css';

// A new component to handle the dynamic theme application
const ThemedApp = () => {
  const { activeTheme } = useSequence();

  useEffect(() => {
    const theme = themes[activeTheme] || themes.default;
    for (const key in theme) {
      document.documentElement.style.setProperty(key, theme[key]);
    }
  }, [activeTheme]);

  return <ProLayout />;
}

function App() {
  return (
    <SoundProvider>
      <SequenceProvider>
        <MediaProvider>
          <ThemedApp />
        </MediaProvider>
      </SequenceProvider>
    </SoundProvider>
  );
}
export default App;