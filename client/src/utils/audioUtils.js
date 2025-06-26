// This utility file holds functions that interact with the Web Audio API.

// We import the single, global audioContext instance.
import { audioContext } from '../contexts/PlaybackContext';

/**
 * Plays a specific time-slice of an AudioBuffer.
 * This is a standalone utility and does not rely on context state.
 * @param {AudioBuffer} audioBuffer - The full audio buffer to slice from.
 * @param {number} bpm - The current beats per minute to calculate slice duration.
 * @param {number} gridOffset - The start time offset of the grid in seconds.
 * @param {number} bar - The bar index of the beat to play.
 * @param {number} beat - The beat index (0-15) of the beat to play.
 */
export const playAudioSlice = (audioBuffer, bpm, gridOffset, bar, beat) => {
    if (!audioBuffer || bpm <= 0 || !audioContext) return;

    // Immediately resume context if suspended (important for user interaction triggers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const secondsPerBeat = 60.0 / bpm;
    const startTime = (gridOffset || 0) + ((bar * 16 + beat) * secondsPerBeat);

    // Create a new AudioBufferSourceNode for each playback
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    // Start playback at the calculated time within the buffer, for the duration of one beat
    source.start(0, startTime, secondsPerBeat);
};