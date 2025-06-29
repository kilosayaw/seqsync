// public/workers/BPMDetectorWorker.js
// Ensure musictempo library is available, e.g., via importScripts or if it's bundled
try {
  if (typeof MusicTempo === 'undefined') { // Guard against multiple imports if script is re-evaluated
    self.importScripts('https://cdn.jsdelivr.net/npm/musictempo@1.0.2/dist/musictempo.min.js');
  }
} catch (e) {
  console.error("BPMDetectorWorker: Failed to import musictempo script.", e);
  self.postMessage({ error: "Failed to load MusicTempo library" });
  // Close the worker if the essential library fails to load
  self.close(); 
}


self.onmessage = async (e) => {
  if (!e.data || !(e.data instanceof ArrayBuffer)) {
    self.postMessage({ error: "Invalid data received by worker. Expected ArrayBuffer." });
    return;
  }
  if (typeof MusicTempo === 'undefined') {
    self.postMessage({ error: "MusicTempo library not available in worker." });
    return;
  }

  const arrayBuffer = e.data;
  
  try {
    // Choose a reasonable duration for analysis, e.g., 30-60 seconds.
    // Too short might be inaccurate, too long increases processing time.
    const analysisDurationSeconds = Math.min(60, arrayBuffer.byteLength / (44100 * 2 * 1)); // Assume 16-bit mono at 44.1kHz for duration rough estimate
    const offlineCtx = new OfflineAudioContext(1, 44100 * analysisDurationSeconds, 44100); 
    
    const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0)); // Use slice(0) to ensure it's a new ArrayBuffer for decodeAudioData if it matters for specific implementations
    
    // MusicTempo expects an array of floats (channel data)
    const channelData = audioBuffer.getChannelData(0); // Process mono

    // MusicTempo constructor can take raw channel data and sample rate
    const tempo = new MusicTempo(channelData, { sampleRate: audioBuffer.sampleRate });

    if (tempo && typeof tempo.tempo === 'number') {
      self.postMessage({ bpm: Math.round(tempo.tempo) });
    } else {
      self.postMessage({ bpm: null, message: "BPM could not be determined by MusicTempo." });
    }
  } catch (error) {
    console.error("BPMDetectorWorker error during processing:", error);
    self.postMessage({ error: error.message || "Error processing audio in worker." });
  }
};