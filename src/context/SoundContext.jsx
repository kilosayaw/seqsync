// src/context/SoundContext.jsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const SoundContext = createContext(null);
export const useSound = () => useContext(SoundContext);

// Map MIDI notes C1 through D#2 (16 notes) to the 16 provided TR-808 samples
const tr808Kit = {
    'C1': '/sounds/kits/tr808/BD7525.wav',    // Pad 1
    'C#1': '/sounds/kits/tr808/BD2575.wav',   // Pad 2
    'D1': '/sounds/kits/tr808/SD7575.wav',    // Pad 3
    'D#1': '/sounds/kits/tr808/SD0050.wav',   // Pad 4
    'E1': '/sounds/kits/tr808/LT00.wav',      // Pad 5
    'F1': '/sounds/kits/tr808/MT25.wav',      // Pad 6
    'F#1': '/sounds/kits/tr808/HT75.wav',     // Placeholder, HT file not in list
    'G1': '/sounds/kits/tr808/RS.wav',       // Pad 8
    'G#1': '/sounds/kits/tr808/CP.wav',       // Pad 9
    'A1': '/sounds/kits/tr808/MA.wav',       // Pad 10
    'A#1': '/sounds/kits/tr808/CB.wav',       // Pad 11
    'B1': '/sounds/kits/tr808/CY7550.wav',    // Pad 12
    'C2': '/sounds/kits/tr808/OH10.wav',      // Pad 13
    'C#2': '/sounds/kits/tr808/CH.wav',       // Pad 14
    'D2': '/sounds/kits/tr808/LC10.wav',      // Pad 15
    'D#2': '/sounds/kits/tr808/HC75.wav',     // Pad 16
};

// We will use this array to easily map a pad's index (0-15) to a MIDI note
export const PAD_TO_NOTE_MAP = Object.keys(tr808Kit);

export const SoundProvider = ({ children }) => {
    const samplerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Ensure Tone.js is started by a user interaction
        const startAudio = async () => {
            await Tone.start();
            console.log("AudioContext started");
        };
        document.body.addEventListener('click', startAudio, { once: true });

        samplerRef.current = new Tone.Sampler({
            urls: tr808Kit,
            baseUrl: '', // Sounds are relative to the /public folder
            onload: () => {
                setIsLoaded(true);
                console.log('[Sound] TR-808 Kit loaded successfully.');
            }
        }).toDestination();

        return () => {
            samplerRef.current?.dispose();
            document.body.removeEventListener('click', startAudio);
        };
    }, []);

    const playSound = (note) => {
        if (samplerRef.current) {
            samplerRef.current.triggerAttack(note);
        }
    };

    const stopSound = (note) => {
        if (samplerRef.current) {
            samplerRef.current.triggerRelease(note);
        }
    };

    const value = { playSound, stopSound }; // Export new function
    return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};