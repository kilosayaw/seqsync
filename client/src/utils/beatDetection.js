// src/utils/beatDetection.js

import { aubio } from 'aubiojs';
import { getAudioContext } from './audioManager';

// Asynchronously loads the Aubio.js WebAssembly module and returns the main class.
async function getAubioInstance() {
  try {
    const { Aubio } = await aubio();
    return Aubio;
  } catch (err) {
    console.error("Failed to initialize Aubio.js:", err);
    return null;
  }
}

/**
 * Analyzes an AudioBuffer to detect beat timestamps using Aubio.js.
 * This is an offline process that's ideal for analyzing a full track.
 * @param {AudioBuffer} audioBuffer - The audio data to analyze.
 * @param {function(number):void} onProgress - A callback to report progress from 0 to 100.
 * @returns {Promise<{bpm: number, beats: number[]}|null>} An object with the estimated BPM and an array of beat timestamps in seconds.
 */
export const detectBeatsFromAudioBuffer = async (audioBuffer, onProgress) => {
  const Aubio = await getAubioInstance();
  if (!Aubio) {
    console.error("Aubio.js instance could not be loaded.");
    onProgress(100); // End progress on failure
    return null;
  }

  const audioContext = getAudioContext();
  if (!audioContext) {
    console.error("AudioContext not available for beat detection.");
    onProgress(100);
    return null;
  }

  const bufferSize = 4096; // Standard processing buffer size
  const hopSize = 512;    // The step size between buffers
  const sampleRate = audioBuffer.sampleRate;

  // Initialize Aubio's tempo (beat tracking) detector
  const tempoDetector = new Aubio.Tempo(bufferSize, hopSize, sampleRate);
  const detectedBeats = [];

  // We process the audio in chunks (frames)
  const channelData = audioBuffer.getChannelData(0); // Analyze the first channel
  const totalFrames = channelData.length;
  let currentFrame = 0;

  console.log("Starting offline beat detection...");
  onProgress(0);

  // Use a non-blocking loop to allow the UI to update
  return new Promise((resolve) => {
    function processChunk() {
        const remainingFrames = totalFrames - currentFrame;
        if (remainingFrames <= 0) {
            onProgress(100);
            console.log(`Offline beat detection complete. Found ${detectedBeats.length} beats.`);
            
            // Estimate BPM from the detected beat intervals
            if (detectedBeats.length > 1) {
                const intervals = [];
                for (let i = 1; i < detectedBeats.length; i++) {
                    intervals.push(detectedBeats[i] - detectedBeats[i - 1]);
                }
                const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
                const bpm = 60 / averageInterval;
                resolve({ bpm: Math.round(bpm), beats: detectedBeats });
            } else {
                resolve(null); // Return null if not enough beats were found
            }
            return;
        }
        
        const framesToProcess = Math.min(remainingFrames, hopSize * 200); // Process a bunch of hops at once
        let endFrame = currentFrame + framesToProcess;

        while(currentFrame + bufferSize < endFrame) {
            const buffer = channelData.slice(currentFrame, currentFrame + bufferSize);
            const isBeat = tempoDetector.do(buffer);
            
            if (isBeat) {
                const beatTimestamp = currentFrame / sampleRate;
                detectedBeats.push(beatTimestamp);
            }
            currentFrame += hopSize;
        }

        const progress = (currentFrame / totalFrames) * 100;
        onProgress(progress);
        
        // Schedule the next chunk of processing
        setTimeout(processChunk, 0);
    }
    processChunk();
  });
};


/**
 * A helper function to get an AudioBuffer from a user-provided file.
 * This is a prerequisite for analysis.
 * @param {File} file - The audio or video file.
 * @returns {Promise<AudioBuffer|null>}
 */
export const getAudioBufferFromFile = async (file) => {
    const audioContext = getAudioContext();
    if (!audioContext) {
        console.error("Cannot get AudioBuffer: AudioContext is not available.");
        return null;
    }
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error("Error decoding audio data from file:", error);
        return null;
    }
};