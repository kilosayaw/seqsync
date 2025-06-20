// /client/src/workers/OnsetDetectorWorker.js

/**
 * @typedef {object} OnsetResult
 * @property {number} time - The time of the detected onset in seconds.
 * @property {number[]} waveform - An array of points representing the waveform of the onset.
 */

// --- CONFIGURATION CONSTANTS ---
const FRAME_SIZE = 1024; // How many audio samples to process in one chunk.
const HOP_SIZE = 512; // Overlap between frames for smoother analysis.
const PEAK_THRESHOLD = 1.35; // A frame's energy must be this much higher than the local average to be a peak.
const REFRACTORY_PERIOD_SAMPLES = 8192; // Ignore new peaks for this many samples after finding one (avoids double-detecting).
const WAVEFORM_SAMPLES = 64; // How many points to generate for the mini-waveform.
const WAVEFORM_CHUNK_SIZE = 4096; // How many audio samples to use for generating the waveform.

self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type !== 'PROCESS_ONSET_DETECTION') {
        return;
    }

    try {
        const { audioData, sampleRate } = payload;
        const data = new Float32Array(audioData);
        const onsets = [];
        let lastPeakPosition = -REFRACTORY_PERIOD_SAMPLES;

        const energies = [];
        // First pass: calculate energy for each frame
        for (let i = 0; i < data.length - FRAME_SIZE; i += HOP_SIZE) {
            let sumOfSquares = 0;
            for (let j = 0; j < FRAME_SIZE; j++) {
                sumOfSquares += data[i + j] ** 2;
            }
            energies.push(sumOfSquares / FRAME_SIZE);
        }

        // Second pass: find peaks in the energy curve
        for (let i = 1; i < energies.length - 1; i++) {
            // A peak is a point higher than its neighbors
            if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1]) {
                const localAverage = energies.slice(Math.max(0, i - 10), i).reduce((a, b) => a + b, 0) / 10 || energies[i];
                
                const currentPosition = i * HOP_SIZE;
                if (
                    energies[i] > localAverage * PEAK_THRESHOLD &&
                    (currentPosition - lastPeakPosition) > REFRACTORY_PERIOD_SAMPLES
                ) {
                    lastPeakPosition = currentPosition;
                    const onsetTime = currentPosition / sampleRate;

                    // --- Generate waveform for this specific onset ---
                    const waveformPoints = [];
                    const waveformStartSample = currentPosition;
                    const peak = 0.8;
                    const step = Math.floor(WAVEFORM_CHUNK_SIZE / WAVEFORM_SAMPLES);
                    for (let k = 0; k < WAVEFORM_SAMPLES; k++) {
                        let max = 0;
                        for (let l = 0; l < step; l++) {
                            const sampleIndex = waveformStartSample + (k * step) + l;
                            if (sampleIndex < data.length) {
                                const an_abs_val = Math.abs(data[sampleIndex]);
                                if (an_abs_val > max) max = an_abs_val;
                            }
                        }
                        waveformPoints.push(Math.min(peak, max) / peak);
                    }
                    
                    onsets.push({ time: onsetTime, waveform: waveformPoints });
                }
            }
        }
        
        self.postMessage({
            type: 'ONSET_RESULTS',
            payload: { onsets }
        });

    } catch (error) {
        self.postMessage({ type: 'ERROR', payload: { message: error.message } });
    }
};