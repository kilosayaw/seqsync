// src/utils/audioManager.js
let audioContext = null;
const preloadedBuffers = {}; // Store by full path
let soundsCurrentlyLoading = 0; // Simple counter

export const getAudioContext = () => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[AudioManager] AudioContext created.');
        if (audioContext.state === 'suspended') {
          console.warn('[AudioManager] AudioContext is initially suspended. User interaction may be needed.');
        }
      } catch (e) {
        console.error('[AudioManager] Error creating AudioContext:', e);
        return null;
      }
    }
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  let ctx = getAudioContext(); // Ensure it's initialized
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
      console.log('[AudioManager] AudioContext resumed successfully.');
    } catch (e) {
      console.error('[AudioManager] Error resuming AudioContext:', e);
      throw e; 
    }
  } else if (!ctx) {
    console.error('[AudioManager] AudioContext not available for resume.');
    throw new Error("AudioContext not available.");
  }
  return ctx; // Return the context, whether it needed resuming or was already running
};

export const preloadSounds = async (soundFilePathsArray) => {
  const ctx = getAudioContext();
  if (!ctx) {
    return Promise.reject(new Error("AudioContext not available for preloading sounds."));
  }
  if (ctx.state === 'suspended') {
    console.warn('[AudioManager] AudioContext is suspended during preload. Attempting resume.');
    try {
      await resumeAudioContext();
    } catch (e) {
      return Promise.reject(new Error("AudioContext suspended and could not be resumed for preload."));
    }
  }

  const uniquePathsToLoad = [...new Set(soundFilePathsArray.filter(path => path && !preloadedBuffers[path]))];
  
  if (uniquePathsToLoad.length === 0) {
    console.log('[AudioManager] All requested sounds already loaded or paths invalid.');
    return Promise.resolve();
  }

  console.log('[AudioManager] Starting sound preloading for:', uniquePathsToLoad);
  soundsCurrentlyLoading += uniquePathsToLoad.length;
  
  const promises = uniquePathsToLoad.map(path => {
    preloadedBuffers[path] = 'loading'; // Mark as loading
    return fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${path}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        preloadedBuffers[path] = audioBuffer;
        console.log(`[AudioManager] Sound "${path}" preloaded successfully.`);
      })
      .catch(error => {
        console.error(`[AudioManager] Error preloading/decoding "${path}":`, error);
        preloadedBuffers[path] = null; // Mark as failed
      })
      .finally(() => {
        soundsCurrentlyLoading--;
      });
  });

  return Promise.allSettled(promises).then(results => {
    console.log('[AudioManager] All requested sound preloading attempts finished.');
    const failedLoads = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && preloadedBuffers[r.value === undefined ? uniquePathsToLoad[results.indexOf(r)] : ''] === null ) ); // A bit complex due to allSettled
    if (failedLoads.length > 0) {
      console.warn(`[AudioManager] ${failedLoads.length} sound(s) failed to load or decode.`);
    }
    return new Promise((resolve) => { // Ensure all async operations within map are done
        const checkLoadingComplete = () => {
            if (soundsCurrentlyLoading === 0) {
                const successfullyLoadedCount = Object.values(preloadedBuffers).filter(b => b && b !== 'loading' && b !== null).length;
                const totalAttempted = uniquePathsToLoad.length;
                console.log(`[AudioManager] Sound preloading batch complete. Successfully loaded: ${successfullyLoadedCount}/${totalAttempted}`);
                resolve();
            } else {
                setTimeout(checkLoadingComplete, 50);
            }
        };
        checkLoadingComplete();
    });
  });
};

export const playSound = (soundPath, options = {}) => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') {
    console.warn('[AudioManager] AudioContext not running/available. Cannot play sound:', soundPath);
    return;
  }

  const buffer = preloadedBuffers[soundPath]; 
  if (buffer && buffer !== 'loading' && buffer !== null) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = options.volume !== undefined ? Math.max(0, Math.min(1, options.volume)) : 1;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    let offset = 0;
    if (options.randomOffset && buffer.duration > 0.05) { 
      offset = Math.random() * 0.02; 
    }
    
    source.start(0, offset); // Play immediately with optional offset
  } else if (buffer === 'loading') {
    console.warn(`[AudioManager] Sound "${soundPath}" is still loading. Playback skipped.`);
  } else {
    console.error(`[AudioManager] Sound "${soundPath}" not preloaded or failed to load. Current status:`, buffer);
  }
};