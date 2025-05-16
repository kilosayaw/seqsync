// client/src/pages/SequencerPage.jsx
import React from 'react';
import StepSequencerControls from '../components/Sequencer/StepSequencerControls.jsx'; // Verify path

const SequencerPage = () => {
  console.log("SequencerPage.jsx rendering StepSequencerControls");
  const handleFullSequenceUpdate = (sequenceData) => {
    console.log('Full sequence updated in Page:', sequenceData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start pt-3 sm:pt-5 font-mono">
      {/* <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 mb-3 sm:mb-5">poSĒQr Sequencer</h1> */} {/* Can uncomment later */}
      <StepSequencerControls onFullSequenceDataChange={handleFullSequenceUpdate} />
    </div>
  );
};

export default SequencerPage;