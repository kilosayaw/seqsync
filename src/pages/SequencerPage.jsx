import React from 'react';
import Studio from '../components/core/studio/Studio';

// Import all the necessary providers
import { SequenceProvider } from '../contexts/SequenceContext';
import { UIStateProvider } from '../contexts/UIStateContext';
import { PlaybackProvider } from '../contexts/PlaybackContext';
import { MediaProvider } from '../contexts/MediaContext';
import { AnalysisProvider } from '../contexts/AnalysisContext';

const SequencerPage = () => {
  return (
    // Wrap the entire page content with the providers in the correct order.
    // Outer providers can't depend on inner ones.
    <SequenceProvider>
      <UIStateProvider>
        <PlaybackProvider>
          <MediaProvider>
            <AnalysisProvider>
              <div style={{ width: '100%', height: '100%' }}>
                <Studio />
              </div>
            </AnalysisProvider>
          </MediaProvider>
        </PlaybackProvider>
      </UIStateProvider>
    </SequenceProvider>
  );
};

export default SequencerPage;