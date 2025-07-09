// src/context/SoundContext.jsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const SoundContext = createContext(null);
export const useSound = () => useContext(SoundContext);
const tr808Kit = {
    'C1': '/sounds/kits/tr808/BD7525.wav', 'C#1': '/sounds/kits/tr808/BD2575.wav',
    'D1': '/sounds/kits/tr808/SD7575.wav', 'D#1': '/sounds/kits/tr808/SD0050.wav',
    'E1': '/sounds/kits/tr808/LT00.wav', 'F1': '/sounds/kits/tr808/MT25.wav',
    'F#1': '/sounds/kits/tr808/HC75.wav', // Corrected from HT
    'G1': '/sounds/kits/tr808/RS.wav', 'G#1': '/sounds/kits/tr808/CP.wav',
    'A1': '/sounds/kits/tr808/MA.wav', 'A#1': '/sounds/kits/tr808/CB.wav',
    'B1': '/sounds/kits/tr808/CY7550.wav', 'C2': '/sounds/kits/tr808/OH10.wav',
    'C#2': '/sounds/kits/tr808/CH.wav', 'D2': '/sounds/kits/tr808/LC10.wav',
    'D#2': '/sounds/kits/tr808/HC75.wav',
};
export const PAD_TO_NOTE_MAP = Object.keys(tr808Kit);

export const SoundProvider = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const samplerRef = useRef(null);

    useEffect(() => {
        // We still create the sampler here on mount
        samplerRef.current = new Tone.Sampler({
            urls: tr808Kit,
            baseUrl: '',
            onload: () => {
                setIsLoaded(true);
                console.log('[Sound] TR-808 Kit loaded successfully.');
            }
        }).toDestination();

        return () => samplerRef.current?.dispose();
    }, []);

    const playSound = async (note) => {
        // DEFINITIVE FIX: Ensure the AudioContext is running before trying to play.
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log("AudioContext started on user interaction.");
        }

        if (isLoaded && samplerRef.current && note) {
            samplerRef.current.triggerAttack(note, Tone.now());
        }
    };
    
    const stopSound = (note) => {
        if (isLoaded && samplerRef.current && note) {
            samplerRef.current.triggerRelease(note, Tone.now());
        }
    };

    const value = { playSound, stopSound };
    
    return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};