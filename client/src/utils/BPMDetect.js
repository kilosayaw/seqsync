// src/utils/BPMDetect.js
let bpmWorker = null;

const getBPMWorker = () => {
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers are not supported in this browser. BPM detection will be limited.');
    return null;
  }
  if (!bpmWorker) {
    try {
      bpmWorker = new Worker('/workers/BPMDetectorWorker.js', { type: 'module' }); 
      console.log('[BPMDetect] BPMDetectorWorker initialized.');
    } catch (e) {
      console.error('[BPMDetect] Failed to initialize BPMDetectorWorker:', e);
      return null;
    }
  }
  return bpmWorker;
};

export const detectBPMFromArrayBuffer = (audioArrayBuffer) => {
  return new Promise((resolve, reject) => {
    const worker = getBPMWorker();
    if (!worker) {
      return reject(new Error("BPM Worker not available."));
    }

    const timeoutId = setTimeout(() => {
      if (bpmWorker && typeof bpmWorker.terminate === 'function') { // Check before terminating
        console.warn("[BPMDetect] Terminating worker due to timeout.");
        bpmWorker.terminate();
        bpmWorker = null; 
      }
      reject(new Error("BPM detection timed out."));
    }, 30000); 

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      if (e.data && typeof e.data.bpm === 'number') {
        resolve(e.data.bpm);
      } else if (e.data && e.data.error) {
        console.error("[BPMDetect] Worker reported error:", e.data.error);
        reject(new Error(e.data.error));
      } else {
        resolve(null); 
      }
      // Consider terminating worker if it's meant for one-off tasks or re-initializing it
      // For now, let's keep it alive for potential multiple detections unless errors occur.
    };

    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      console.error('[BPMDetect] Error from BPMDetectorWorker:', e);
      reject(new Error(`BPM Worker error: ${e.message || 'Unknown worker error'}`));
      if (bpmWorker && typeof bpmWorker.terminate === 'function') {
        bpmWorker.terminate();
        bpmWorker = null;
      }
    };
    
    if (audioArrayBuffer instanceof ArrayBuffer) {
        worker.postMessage(audioArrayBuffer, [audioArrayBuffer]); 
    } else {
        clearTimeout(timeoutId);
        reject(new Error("Invalid data type: Expected ArrayBuffer for BPM detection."));
    }
  });
};

export const detectBPMFromFile = async (audioFile) => {
  if (!audioFile) {
    return Promise.resolve(null);
  }
  if (!(audioFile instanceof File)) {
    console.error('[BPMDetect] detectBPMFromFile: provided argument is not a File object.');
    return Promise.reject(new Error('Invalid argument: audioFile must be a File object.'));
  }
  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    return await detectBPMFromArrayBuffer(arrayBuffer);
  } catch (error) {
    console.error('[BPMDetect] Error processing file for BPM detection:', error);
    return Promise.resolve(null); 
  }
};