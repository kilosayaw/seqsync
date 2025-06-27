// public/workers/BPMDetectorWorker.js

try {
  // FINAL FIX: The correct URL for jsdelivr.
  self.importScripts('https://cdn.jsdelivr.net/npm/musictempo@1.0.2/dist/musictempo.min.js');
} catch (e) {
  console.error("BPMDetectorWorker: Failed to import musictempo script.", e);
  self.postMessage({ type: 'error', message: "Failed to load BPM detection library." });
}

self.onmessage = async (e) => {
  if (typeof MusicTempo === 'undefined') {
    self.postMessage({ type: 'error', message: "MusicTempo library not available in worker." });
    return;
  }
  
  const arrayBuffer = e.data.audioData;
  if (!arrayBuffer) {
    self.postMessage({ type: 'error', message: 'No audio data received.'});
    return;
  }

  try {
    const sampleRate = 44100;
    // Using a portion of the audio for faster analysis
    const durationToProcess = Math.min(60, arrayBuffer.byteLength / (sampleRate * 2)); 
    const offlineContext = new OfflineAudioContext(1, sampleRate * durationToProcess, sampleRate);
    
    const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer.slice(0));
    const channelData = audioBuffer.getChannelData(0);

    const tempo = new MusicTempo(channelData, {
      sampleRate: audioBuffer.sampleRate,
    });

    if (tempo && typeof tempo.tempo === 'number' && tempo.tempo > 0) {
      self.postMessage({ type: 'success', bpm: Math.round(tempo.tempo) });
    } else {
      self.postMessage({ type: 'error', message: "BPM could not be determined." });
    }
  } catch (error) {
    console.error("BPMDetectorWorker error:", error);
    self.postMessage({ type: 'error', message: error.message || "Error processing audio in worker." });
  }
};