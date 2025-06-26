// This worker analyzes a raw audio buffer chunk and generates a simplified waveform path.
self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type !== 'PROCESS_AUDIO_CHUNK') {
        return;
    }

    try {
        const { audioChunk, bar, beat } = payload;
        const data = new Float32Array(audioChunk);
        
        const samples = 64; // How many points we want in our waveform SVG
        const waveformPoints = [];
        const peak = 0.8; // Clamp the visual output to avoid clipping

        const step = Math.floor(data.length / samples);

        for (let i = 0; i < samples; i++) {
            // Get the max value in a chunk of samples
            let max = 0;
            for (let j = 0; j < step; j++) {
                const an_abs_val = Math.abs(data[(i * step) + j]);
                if (an_abs_val > max) {
                    max = an_abs_val;
                }
            }
            waveformPoints.push(Math.min(peak, max) / peak);
        }

        self.postMessage({
            type: 'WAVEFORM_RESULT',
            payload: { waveformPoints, bar, beat }
        });

    } catch (error) {
        self.postMessage({ type: 'ERROR', payload: { message: error.message } });
    }
};