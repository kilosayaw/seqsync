// src/pages/SequencerPage.jsx
import React from 'react';
import Studio from '../components/core/studio/Studio';

const SequencerPage = () => {
  return (
    // The Studio component is designed to manage its own layout and fill the screen.
    // This parent div ensures the page context gives it the space it needs.
    <div className="w-full h-screen bg-dark-bg overflow-hidden">
      <Studio />
    </div>
  );
};

export default SequencerPage;