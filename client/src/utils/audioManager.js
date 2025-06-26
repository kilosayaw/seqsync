// /client/src/utils/audioManager.js

let audioContext = null;
const soundBuffers = new Map();

// Initialize the global AudioContext
export const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// Resume the AudioContext if it's suspended (required by browsers)
export const unlockAudioContext = () => {
    const context = getAudioContext();
    if (context.state === 'suspended') {
        context.resume();
    }
};

// Preload sounds to avoid delays on first play
export const preloadSounds = async (soundUrls) => {
    const context = getAudioContext();
    const promises = soundUrls.map(async (url) => {
        if (soundBuffers.has(url)) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            soundBuffers.set(url, audioBuffer);
        } catch (error) {
            console.error(`Failed to load sound: ${url}`, error);
        }
    });
    await Promise.all(promises);
};

// Play a preloaded sound
export const playSound = (url) => {
    const context = getAudioContext();
    const buffer = soundBuffers.get(url);
    if (!buffer) {
        console.warn(`Sound not preloaded or failed to load: ${url}`);
        return;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
};

// --- THIS IS THE MISSING FUNCTION ---
// Plays a small slice of a larger audio buffer
export const playAudioSlice = (mainBuffer, bpm, gridOffset, barIndex, beatIndex) => {
    if (!mainBuffer) return;
    
    const context = getAudioContext();
    unlockAudioContext();

    // Calculate the duration of one 16th note in seconds
    const beatsPerBar = 16;
    const secondsPerBeat = 60.0 / bpm;
    const beatDuration = secondsPerBeat / 4; // Assuming 16th notes

    // Calculate the start time of the slice in seconds
    const startTime = gridOffset + ((barIndex * beatsPerBar + beatIndex) * beatDuration);

    if (startTime >= mainBuffer.duration) {
        return; // Don't play if the start time is past the end of the buffer
    }

    const source = context.createBufferSource();
    source.buffer = mainBuffer;
    source.connect(context.destination);

    // Play the slice: start at `startTime` for `beatDuration` seconds
    source.start(0, startTime, beatDuration);
};

// This function is for generating the visual waveform, separate from playback
export const generateWaveform = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const context = getAudioContext();
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            
            const rawData = audioBuffer.getChannelData(0); // Get data from left channel
            const samples = 200; // Number of data points for the waveform
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];
            for (let i = 0; i < samples; i++) {
                let blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum = sum + Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }
            resolve(filteredData);
        } catch (e) {
            reject(e);
        }
    });
};