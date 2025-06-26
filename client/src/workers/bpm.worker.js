// This file uses the MusicTempo.js library you provided earlier.
// Ensure MusicTempo.js is in your /public directory or otherwise accessible.
self.importScripts('/MusicTempo.js');

// Helper to decode audio data from a file's ArrayBuffer
const getAudioBuffer = async (arrayBuffer, audioContext) => {
    try {
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Worker: Error decoding audio data.", error);
        return null;
    }
};

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === 'ANALYZE_BPM') {
        const { file } = payload;
        
        try {
            // We need a temporary AudioContext inside the worker for decoding.
            const tempAudioContext = new self.OfflineAudioContext(1, 1, 44100);
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await getAudioBuffer(arrayBuffer, tempAudioContext);

            if (!audioBuffer) {
                throw new Error("Could not create AudioBuffer for analysis.");
            }
            
            // Use the MusicTempo library to get the BPM
            const musicTempo = new MusicTempo.MusicTempo(audioBuffer.getChannelData(0), {
                sampleRate: audioBuffer.sampleRate
            });

            const detectedBpm = Math.round(musicTempo.tempo);
            
            // Send the result back to the main thread
            self.postMessage({
                type: 'BPM_ANALYSIS_COMPLETE',
                payload: { bpm: detectedBpm }
            });

        } catch (error) {
            console.error("BPM Worker Error:", error);
            self.postMessage({
                type: 'BPM_ANALYSIS_ERROR',
                payload: { message: error.message }
            });
        }
    }
};