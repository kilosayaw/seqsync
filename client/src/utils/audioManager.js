// src/utils/audioManager.js

let audioContext = null;
const audioBuffers = new Map(); // Stores preloaded AudioBuffers: { url: AudioBuffer }

// --- Logging Helper (internal to this module) ---
const logAudio = (level, message, ...args) => {
  const prefix = `[AudioManager|${level.toUpperCase()}]`;
  if (level === 'error') console.error(prefix, message, ...args);
  else if (level === 'warn') console.warn(prefix, message, ...args);
  // else console.log(prefix, message, ...args); // Uncomment for debug/info
};

// --- AudioContext Management ---
const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      logAudio('info', `AudioContext ${audioContext.state}.`);
      if (audioContext.state === 'suspended') {
        logAudio('warn', 'AudioContext is suspended. User interaction is required to resume.');
      }
    } catch (e) {
      logAudio('error', 'Web Audio API is not supported.', e);
      return null;
    }
  }
  // If context was created but became suspended (e.g. page inactive then active again)
  if (audioContext && audioContext.state === 'suspended') {
    logAudio('warn', 'AudioContext is suspended. Attempting to resume on next interaction or playSound.');
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  const context = getAudioContext(); // Ensures context is initialized if not already
  if (context && context.state === 'suspended') {
    try {
      await context.resume();
      logAudio('info', 'AudioContext resumed successfully via resumeAudioContext().');
    } catch (e) {
      logAudio('error', 'Error resuming AudioContext:', e);
    }
  } else if (context) {
    logAudio('debug', `AudioContext already in state: ${context.state}`);
  }
};

// --- Sound Loading ---
const loadSound = async (soundObject) => { // Expects { name, url }
  const { url, name } = soundObject;
  if (!url) {
    logAudio('warn', `loadSound: URL is missing for sound '${name}'.`);
    return Promise.reject(new Error(`URL is missing for sound '${name}'.`));
  }
  if (audioBuffers.has(url)) {
    logAudio('debug', `loadSound: Sound '${name}' (${url}) already cached.`);
    return Promise.resolve({ url, name, status: 'cached', buffer: audioBuffers.get(url) });
  }

  const context = getAudioContext();
  if (!context) {
    return Promise.reject(new Error("AudioContext not available for loading sounds."));
  }

  logAudio('debug', `loadSound: Fetching '${name}' from ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Status: ${response.status}`);
      logAudio('error', `loadSound: HTTP error ${response.status} for '${name}' (${url}). Response: ${errorText.substring(0,100)}`);
      throw new Error(`HTTP error ${response.status} for ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    logAudio('debug', `loadSound: Decoding '${name}' (${url})`);
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    audioBuffers.set(url, audioBuffer);
    logAudio('info', `loadSound: Sound '${name}' (${url}) DECODED & CACHED.`);
    return { url, name, status: 'loaded', buffer: audioBuffer };
  } catch (error) {
    logAudio('error', `loadSound: Error loading/decoding '${name}' (${url}):`, error.message);
    audioBuffers.delete(url); // Clean up if failed
    return Promise.reject({ url, name, status: 'failed', error });
  }
};

/**
 * Preloads an array of sound objects. This function is designed for batch loading.
 * It attempts to load all sounds and reports success/failure counts.
 * @param {Array<{name: string, url: string}>} sounds - Array of sound objects.
 * @returns {Promise<{loadedCount: number, failedCount: number, totalToLoad: number}>}
 *          A promise that resolves with statistics once all load attempts in this batch are settled.
 */
export const preloadSounds = async (sounds) => {
  if (!Array.isArray(sounds)) {
    logAudio('warn', 'preloadSounds: Invalid input - sounds is not an array.');
    return Promise.resolve({ loadedCount: 0, failedCount: 0, totalToLoad: 0 });
  }
  const soundsToLoad = sounds.filter(sound => sound && sound.url && !audioBuffers.has(sound.url));

  if (soundsToLoad.length === 0) {
    logAudio('info', 'preloadSounds: No new sounds to load or all requested sounds already cached.');
    const cachedCount = sounds.filter(s => s && s.url && audioBuffers.has(s.url)).length;
    return Promise.resolve({ loadedCount: cachedCount, failedCount: 0, totalToLoad: sounds.length });
  }

  logAudio('info', `preloadSounds: Starting batch preload for ${soundsToLoad.length} new sounds (out of ${sounds.length} requested).`);

  const loadPromises = soundsToLoad.map(sound =>
    loadSound(sound) // loadSound now returns { url, name, status, buffer } or rejects with { url, name, status, error }
      .then(result => ({ ...result, outcome: 'fulfilled' })) // Mark as fulfilled for easier counting
      .catch(errorResult => ({ ...errorResult, outcome: 'rejected' })) // Mark as rejected
  );

  // Wait for all promises in the batch to settle (either resolve or reject)
  const results = await Promise.allSettled(loadPromises); 
  // Note: Promise.allSettled wraps loadSound's result/rejection in an object:
  // { status: 'fulfilled', value: {url,name,status,buffer} } or { status: 'rejected', reason: {url,name,status,error} }

  let loadedCount = 0;
  let failedCount = 0;

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      // The value from loadSound was { url, name, status: 'loaded', buffer } if successful
      // or { url, name, status: 'failed', error } if loadSound caught an error but returned it to map's catch.
      // My refined loadSound now directly rejects.
      // So fulfilled means loadSound itself resolved.
      logAudio('debug', `Preload success (from allSettled): ${result.value.name}`);
      loadedCount++;
    } else { // result.status === 'rejected'
      logAudio('warn', `Preload failure (from allSettled): ${result.reason.name}`, result.reason.error?.message);
      failedCount++;
    }
  });
  
  // Count sounds that were already cached before this batch
  const initiallyCachedCount = sounds.length - soundsToLoad.length;
  loadedCount += initiallyCachedCount;


  logAudio('info', `preloadSounds: Batch COMPLETE. Total Attempted in Batch: ${soundsToLoad.length}. Successfully Loaded/Cached in Batch: ${loadedCount - initiallyCachedCount}. Failed in Batch: ${failedCount}.`);
  return { loadedCount, failedCount, totalToLoad: sounds.length };
};

// --- Sound Playback ---
export const playSound = (url, volume = 1, playbackRate = 1, startTime = 0) => {
  const context = getAudioContext();
  if (!context) {
    logAudio('error', 'playSound: AudioContext not available.');
    return null;
  }

  if (context.state === 'suspended') {
    logAudio('warn', 'playSound: AudioContext is suspended. Playback may fail. Attempting to resume...');
    // Attempt to resume, but playback might still fail if gesture is needed.
    // User interaction (e.g. a general click on the page) should call resumeAudioContext() explicitly.
    context.resume().catch(err => logAudio('error', 'playSound: Failed to resume suspended AudioContext.', err));
    // Don't return immediately; let it try to play if resume was quick, but be aware it might fail.
  }

  const audioBuffer = audioBuffers.get(url);
  if (!audioBuffer) {
    logAudio('warn', `playSound: Sound not preloaded or load failed for '${url}'. Attempting on-the-fly load.`);
    // On-the-fly load (will have latency, not ideal for rhythmic triggering)
    loadSound({ url, name: url.substring(url.lastIndexOf('/') + 1) }) // Pass a sound-like object
      .then(result => {
        if (result.status === 'loaded') {
          logAudio('info', `playSound: On-the-fly load successful for '${url}'. Retrying play.`);
          playSound(url, volume, playbackRate, startTime); // Retry play
        } else {
          logAudio('error', `playSound: On-the-fly load FAILED for '${url}'.`);
        }
      })
      .catch(errorDetails => {
        logAudio('error', `playSound: On-the-fly load EXCEPTION for '${url}':`, errorDetails.error?.message);
      });
    return null; // Don't play immediately if not preloaded
  }

  try {
    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), context.currentTime);
    source.playbackRate.setValueAtTime(Math.max(0.1, Math.min(8, playbackRate)), context.currentTime); // Wider playbackRate range

    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(0, startTime); // Play immediately (context.currentTime) from specified offset
    
    logAudio('debug', `playSound: Playing '${url}' (Vol:${volume}, Rate:${playbackRate}, Start:${startTime})`);
    return source; // Return the source node so it can be stopped if needed
  } catch (error) {
    logAudio('error', `playSound: Error playing sound '${url}':`, error.message, error);
    return null;
  }
};

// --- Utility Functions ---
export const stopAllSounds = () => {
  // This is tricky with Web Audio API as there's no global "stop all".
  // You'd need to track all active AudioBufferSourceNodes and call .stop() on each.
  // For a sequencer with short samples, this is often not necessary.
  // If you have long samples or loops, manage their source nodes.
  logAudio('warn', 'stopAllSounds: Functionality is complex and requires tracking active sources. Not fully implemented for global stop.');
  // If truly needed, could try disconnecting and reconnecting master gain or recreating context,
  // but that's heavy-handed.
};

export const clearSoundCache = () => {
  audioBuffers.clear();
  logAudio('info', 'All cached audio buffers cleared.');
};

// Attempt to initialize AudioContext when module loads.
// User gesture will still be needed if it starts suspended.
getAudioContext();