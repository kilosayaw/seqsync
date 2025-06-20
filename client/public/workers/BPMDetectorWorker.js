import { MusicTempo } from './musictempo.js';

self.onmessage = async (e) => {
    try {
        const float32Array = new Float32Array(e.data.audioData);

        const audioBuffer = {
            getChannelData: () => float32Array
        };
        
        const tempo = new MusicTempo(audioBuffer, {});

        if (tempo && tempo.tempo > 0) {
            self.postMessage({ type: 'success', bpm: tempo.tempo });
        } else {
            throw new Error('Could not determine a confident BPM.');
        }

    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
};