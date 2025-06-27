// public/workers/BPMDetectorWorker.js

// Use the modern ES Module import syntax
import { MusicTempo } from './musictempo.js';

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type !== 'ANALYZE_BPM') {
        return;
    }

    try {
        const { file } = payload;
        if (!file) {
            throw new Error('No file provided to worker.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new OfflineAudioContext(1, 44100 * 30, 44100); // Process up to 30s
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // This is an intensive task, perfect for a worker
        const musicTempo = new MusicTempo(audioBuffer);
        
        // Send the result back to the main thread
        self.postMessage({
            type: 'BPM_ANALYSIS_COMPLETE',
            payload: {
                bpm: musicTempo.tempo,
            },
        });
    } catch (err) {
        console.error('Error during BPM detection in worker:', err);
        self.postMessage({
            type: 'BPM_ANALYSIS_ERROR',
            payload: { message: err.message || 'An unknown error occurred during BPM detection.' },
        });
    }
};