// src/services/ToneService.js
import * as Tone from 'tone';

class ToneService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    await Tone.start();
    Tone.Transport.bpm.value = 120; // Default
    this.isInitialized = true;
    console.log("Tone.js Initialized");
  }

  setBPM(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  // Schedule visual updates with this
  scheduleVisualEvent(time, callback) {
    return Tone.Transport.schedule(callback, time);
  }

  play() {
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
  }
  
  get transport() {
      return Tone.Transport;
  }
}

export const toneService = new ToneService();