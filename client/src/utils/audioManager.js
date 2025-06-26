// src/utils/audioManager.js
let audioContext = null;
const audioBuffers = new Map();

export const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[AudioManager] audioManager.js:11 AudioContext created.');
    } catch (e) {
      console.error('[AudioManager] Error creating AudioContext:', e);
      return null; // Return null if creation fails
    }
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (!ctx) return null; // No context to resume

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
      console.log('[AudioManager] AudioContext resumed successfully.');
    } catch (e) {
      console.error('[AudioManager] Error resuming AudioContext:', e);
      // Don't re-throw, allow preloadSounds to handle the outcome
    }
  }
  return ctx; // Return context regardless of initial state if it exists
};

export const preloadSounds = async (soundsToLoad) => {
  if (!Array.isArray(soundsToLoad)) {
    console.error('[AudioManager] preloadSounds: soundsToLoad must be an array.');
    return { loaded: 0, failed: soundsToLoad?.length || 0, total: soundsToLoad?.length || 0 };
  }
  
  let ctx = getAudioContext();
  if (!ctx) {
    console.error('[AudioManager] AudioContext not available for preloading.');
    return { loaded: 0, failed: soundsToLoad.length, total: soundsToLoad.length };
  }
  if (ctx.state === 'suspended') {
    await resumeAudioContext(); // Attempt resume
    ctx = getAudioContext(); // Re-fetch potentially resumed context
    if (!ctx || ctx.state !== 'running') {
        console.warn('[AudioManager] AudioContext could not be resumed for preloading.');
        return { loaded: 0, failed: soundsToLoad.length, total: soundsToLoad.length };
    }
  }

  console.log('[AudioManager] audioManager.js:62 Starting sound preloading for:', soundsToLoad.map(s => s.name || s.url));
  let loadedCount = 0;
  let failedCount = 0;

  const promises = soundsToLoad.map(async (sound) => {
    if (!sound || typeof sound.url !== 'string') {
      console.warn('[AudioManager] Invalid sound object for preloading (missing or invalid URL):', sound);
      failedCount++;
      return;
    }
    if (audioBuffers.has(sound.url)) {
      loadedCount++;
      return;
    }
    try {
      const response = await fetch(sound.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${sound.url}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer); // This is where EncodingError happens
      audioBuffers.set(sound.url, audioBuffer);
      loadedCount++;
    } catch (error) {
      // Log detailed error, including the sound object
      console.error(`[AudioManager] audioManager.js:80 Error preloading/decoding "${sound.name || sound.url}" (URL: ${sound.url}):`, error);
      failedCount++;
    }
  });

  await Promise.all(promises);
  console.log(`[AudioManager] audioManager.js:89 All requested sound preloading attempts finished.`);
  if (failedCount > 0) {
    console.warn(`[AudioManager] audioManager.js:92 ${failedCount} sound(s) failed to load or decode.`);
  }
  console.log(`[AudioManager] audioManager.js:99 Sound preloading batch complete. Successfully loaded: ${loadedCount}/${soundsToLoad.length}`);
  return { loaded: loadedCount, failed: failedCount, total: soundsToLoad.length };
};

export const playSound = (url, options = {}) => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') {
    console.warn('[AudioManager] AudioContext not running. Cannot play sound:', url);
    return null;
  }
  const audioBuffer = audioBuffers.get(url);
  if (!audioBuffer) {
    console.warn(`[AudioManager] Sound not preloaded or error in buffer: ${url}.`);
    return null; // Don't attempt dynamic load here for stability, focus on preload
  }
  try {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    if (options.loop) source.loop = true;
    source.start(options.when || 0);
    return source;
  } catch (error) {
    console.error(`[AudioManager] Error playing sound ${url}:`, error);
    return null;
  }
};

export default { getAudioContext, resumeAudioContext, preloadSounds, playSound };