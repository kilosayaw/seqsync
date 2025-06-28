// src/hooks/useAudio.js
import { useCallback, useEffect, useState, useRef } from 'react';
import {  
  resumeAudioContext, 
  preloadSounds as managerPreloadSounds, 
  playSound as managerPlaySound 
} from '../utils/audioManager'; 

export const useAudio = (initialSoundFilesToPreload = []) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [areSoundsPreloaded, setAreSoundsPreloaded] = useState(false);
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  
  const preloadedPathsRef = useRef(new Set());

  useEffect(() => {
    let isMounted = true;
    const initAudio = async () => {
      try {
        const ctx = await resumeAudioContext(); 
        if (isMounted) {
          setAudioCtx(ctx);
          setIsAudioReady(ctx && ctx.state === 'running');
        }
      } catch (e) {
        console.error("[useAudio] Error initializing audio context:", e);
        if (isMounted) setIsAudioReady(false);
      }
    };
    initAudio();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAudioReady && initialSoundFilesToPreload.length > 0 && !isLoadingSounds) {
      const soundsToActuallyPreload = initialSoundFilesToPreload.filter(p => p && !preloadedPathsRef.current.has(p));
      
      if (soundsToActuallyPreload.length > 0) {
        setIsLoadingSounds(true);
        managerPreloadSounds(soundsToActuallyPreload)
          .then(() => {
            if (isMounted) {
              soundsToActuallyPreload.forEach(p => preloadedPathsRef.current.add(p));
              const allInitialPreloaded = initialSoundFilesToPreload.every(p => !p || preloadedPathsRef.current.has(p));
              setAreSoundsPreloaded(allInitialPreloaded);
            }
          })
          .catch(e => console.error("[useAudio] Error preloading initial sounds:", e))
          .finally(() => {
            if (isMounted) setIsLoadingSounds(false);
          });
      } else if (initialSoundFilesToPreload.every(p => !p || preloadedPathsRef.current.has(p))) {
          if (isMounted && !areSoundsPreloaded) setAreSoundsPreloaded(true);
      }
    }
    return () => { isMounted = false; };
  }, [isAudioReady, initialSoundFilesToPreload, isLoadingSounds, areSoundsPreloaded]);

  const playSound = useCallback((soundPath, options) => {
    if (isAudioReady && (preloadedPathsRef.current.has(soundPath))) {
      managerPlaySound(soundPath, options);
    } else {
      console.warn(`[useAudio] Conditions not met to play sound "${soundPath}". AudioReady: ${isAudioReady}, Preloaded: ${preloadedPathsRef.current.has(soundPath)}`);
    }
  }, [isAudioReady]);

  const preloadSounds = useCallback(async (soundFilePathsArray) => {
    if (!isAudioReady || isLoadingSounds) {
      console.warn('[useAudio] Cannot preload: Audio not ready or already loading sounds.');
      return Promise.reject(new Error("Audio not ready or already loading."));
    }
    const soundsToActuallyPreload = soundFilePathsArray.filter(p => p && !preloadedPathsRef.current.has(p));
    if (soundsToActuallyPreload.length > 0) {
      setIsLoadingSounds(true);
      try {
        await managerPreloadSounds(soundsToActuallyPreload);
        soundsToActuallyPreload.forEach(p => preloadedPathsRef.current.add(p));
        const allInitialPreloaded = initialSoundFilesToPreload.every(p => !p || preloadedPathsRef.current.has(p));
        if(allInitialPreloaded && !areSoundsPreloaded) setAreSoundsPreloaded(true);
      } catch (e) {
        console.error("[useAudio] Error preloading additional sounds:", e);
        throw e; 
      } finally {
        setIsLoadingSounds(false);
      }
    } else {
      return Promise.resolve();
    }
  }, [isAudioReady, isLoadingSounds, initialSoundFilesToPreload, areSoundsPreloaded]); 

  return { 
    isAudioReady, 
    areSoundsPreloaded, 
    isLoadingSounds,
    playSound, 
    preloadSounds, 
    audioContext: audioCtx 
  };
};