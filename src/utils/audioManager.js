// src/utils/audioManager.js
let audioContext = null;
let isAudioContextUnlocked = false;
const audioBufferCache = new Map();

const logAudio = (level, message, ...args) => {
    const prefix = `[AudioManager|${level.toUpperCase()}]`;
    if (process.env.NODE_ENV === 'development') {
        console.log(prefix, message, ...args);
    }
};

export const getAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            logAudio('info', `AudioContext created in ${audioContext.state} state.`);
        } catch (e) {
            logAudio('error', 'Web Audio API is not supported.', e);
            return null;
        }
    }
    return audioContext;
};

export const unlockAudioContext = () => {
    const context = getAudioContext();
    if (context && context.state === 'suspended') {
        context.resume().then(() => {
            isAudioContextUnlocked = true;
            logAudio('info', "AudioContext resumed successfully.");
        });
    } else if (context) {
        isAudioContextUnlocked = true;
    }
};

const loadSound = async (soundObject) => {
    const { url, name } = soundObject;
    if (!url) return Promise.reject(new Error(`URL missing for ${name}.`));
    if (audioBufferCache.has(url)) return Promise.resolve(audioBufferCache.get(url));

    const context = getAudioContext();
    if (!context) return Promise.reject(new Error("AudioContext not available."));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        audioBufferCache.set(url, audioBuffer);
        return audioBuffer;
    } catch (error) {
        logAudio('error', `Failed to load '${name}':`, error.message);
        throw error;
    }
};

export const preloadSounds = async (sounds) => {
    if (!Array.isArray(sounds) || sounds.length === 0) return;
    const loadPromises = sounds.map(sound => loadSound(sound).catch(e => e));
    await Promise.allSettled(loadPromises);
    logAudio('info', `${sounds.length} sounds preloading process initiated.`);
};

export const playSound = (url) => {
    const context = getAudioContext();
    if (!context || !isAudioContextUnlocked) {
        logAudio('warn', `Cannot play sound: AudioContext not unlocked for ${url}. Call unlockAudioContext() on user interaction.`);
        return;
    }
    const audioBuffer = audioBufferCache.get(url);
    if (!audioBuffer) {
        logAudio('warn', `Sound not preloaded: ${url}. Attempting to load and play.`);
        loadSound({url, name: url}).then(buffer => {
            if (buffer) playSound(url);
        });
        return;
    }

    try {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start(0);
    } catch (error) {
        logAudio('error', `Error playing sound '${url}':`, error);
    }
};

/**
 * Plays a specific time-slice of an AudioBuffer.
 * This is now part of the unified audioManager.
 * @param {AudioBuffer} audioBuffer - The full audio buffer to slice from.
 * @param {number} bpm - The current beats per minute to calculate slice duration.
 * @param {number} gridOffset - The start time offset of the grid in seconds.
 * @param {number} bar - The bar index of the beat to play.
 * @param {number} beat - The beat index (0-15) of the beat to play.
 */
export const playAudioSlice = (audioBuffer, bpm, gridOffset, bar, beat) => {
    const context = getAudioContext();
    if (!audioBuffer || bpm <= 0 || !context || !isAudioContextUnlocked) return;

    const secondsPerBeat = 60.0 / bpm;
    const startTime = (gridOffset || 0) + ((bar * 16 + beat) * secondsPerBeat);

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);

    source.start(0, startTime, secondsPerBeat);
};