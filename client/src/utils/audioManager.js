// client/src/utils/audioManager.js
let audioContext = null;
let isAudioContextUnlocked = false;
const audioBufferCache = new Map();

const logAudio = (level, message, ...args) => {
    const prefix = `[AudioManager|${level.toUpperCase()}]`;
    if (process.env.NODE_ENV === 'development') {
        console.log(prefix, message, ...args);
    }
};

// This function can be called safely at any time.
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

// This function MUST be called after a user interaction (e.g., a click).
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
    if (audioBufferCache.has(url)) return Promise.resolve();

    const context = getAudioContext();
    if (!context) return Promise.reject(new Error("AudioContext not available."));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        audioBufferCache.set(url, audioBuffer);
    } catch (error) {
        logAudio('error', `Failed to load '${name}':`, error.message);
        throw error;
    }
};

export const preloadSounds = async (sounds) => {
    if (!Array.isArray(sounds) || sounds.length === 0) return;
    const loadPromises = sounds.map(sound => loadSound(sound).catch(() => {}));
    await Promise.all(loadPromises);
};

export const playSound = (url) => {
    const context = getAudioContext();
    if (!context || !isAudioContextUnlocked) {
        logAudio('warn', `Cannot play sound: AudioContext not unlocked for ${url}. Call unlockAudioContext() on user interaction.`);
        return;
    }
    const audioBuffer = audioBufferCache.get(url);
    if (!audioBuffer) {
        logAudio('warn', `Sound not preloaded: ${url}.`);
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