// src/pages/SequencerPage.jsx
import React from 'react';
import StepSequencerControls from '../components/core/sequencer/StepSequencerControls';

const SequencerPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-0">
      {/* The StepSequencerControls component itself has padding, so this container can be minimal */}
      <StepSequencerControls />
    </div>
  );
};

export default SequencerPage;