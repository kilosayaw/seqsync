import React from 'react';

// --- CONTEXT PROVIDERS ---
import { SequencerSettingsProvider } from '../contexts/SequencerSettingsContext';
import { SequenceProvider } from '../contexts/SequenceContext';
import { PlaybackProvider } from '../contexts/PlaybackContext';
import { UIStateProvider } from '../contexts/UIStateContext';
import { MotionAnalysisProvider } from '../contexts/MotionAnalysisContext';
import { MediaProvider } from '../contexts/MediaContext';

// --- MAIN COMPONENT IMPORT ---
import Sequencer from '../components/Sequencer';

const SequencerPage = () => {
  return (
    // --- THE DEFINITIVE, CORRECT NESTING ORDER ---
    <SequencerSettingsProvider>
      <SequenceProvider>
        <PlaybackProvider>
          <UIStateProvider>
            <MediaProvider>
              <MotionAnalysisProvider>
                <Sequencer />
              </MotionAnalysisProvider>
            </MediaProvider>
          </UIStateProvider>
        </PlaybackProvider>
      </SequenceProvider>
    </SequencerSettingsProvider>
  );
};

export default SequencerPage;