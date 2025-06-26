import { useEffect, useRef } from 'react';
import { usePlayback } from '../contexts/PlaybackContext';
import { useSequence } from '../contexts/SequenceContext';

export const useRecording = () => {
    const { isRecording, currentBar, currentStep, getLivePose } = usePlayback();
    const { setPoseForBeat } = useSequence();
    
    // This ref helps us avoid recording the same beat multiple times if a re-render happens.
    const lastRecordedGlobalIndex = useRef(null);

    useEffect(() => {
        // If we are not recording, there's nothing to do.
        if (!isRecording) return;
        
        // When the playback clock ticks to a new step (e.g., currentStep becomes 8),
        // it means beat 7 has JUST completed. The pose in the live ref at this exact
        // moment is the final, settled pose for beat 7.
        
        let barToRecord = currentBar;
        let beatToRecord = currentStep - 1;

        // Handle wrapping around from the first beat of a bar to the last beat of the previous bar.
        if (beatToRecord < 0) {
            if (barToRecord > 0) {
                beatToRecord = 15; // Last beat of the previous bar
                barToRecord = currentBar - 1;
            } else {
                // We are on the very first beat (0:0), so there's nothing to record yet.
                return;
            }
        }
        
        const globalIndexToRecord = (barToRecord * 16) + beatToRecord;

        // Only record if this is a new beat we haven't saved yet. This prevents the infinite loop.
        if (globalIndexToRecord !== lastRecordedGlobalIndex.current) {
            const livePose = getLivePose();
            if (livePose) {
                console.log(`Recording pose for beat: ${barToRecord}:${beatToRecord}`);
                setPoseForBeat(barToRecord, beatToRecord, livePose);
                lastRecordedGlobalIndex.current = globalIndexToRecord; // Mark this beat as recorded.
            }
        }
        
    }, [isRecording, currentStep, currentBar, setPoseForBeat, getLivePose]);
};