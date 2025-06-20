// src/components/core/sequencer/AudioBeatVisualizer.jsx
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getAudioContext } from '../../../utils/audioManager';
// CORRECTED: Import the mode constants
import { MODE_SYNC, MODE_SEQ, MODE_POS } from '../../../utils/constants'; 

const AudioBeatVisualizer = ({
  isPlaying,
  appMode,
  timeSignature,
  mediaElement,
  mediaDuration,
  mediaCurrentTime,
  sequencerCurrentBar,
  sequencerCurrentBeatIndex, 
  songData,
  NUM_BEATS_PER_BAR, 
  resolution, 
  sequencerWasActive,
  onSeek, 
  loopStartGlobalTick, 
  loopEndGlobalTick,   
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null); 
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null); 
  const dataArrayRef = useRef(null);
  
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }
  }, []);

  const totalTicksInSong = useMemo(() => {
    if (!songData || Object.keys(songData).length === 0) {
      const beatsPerBar = timeSignature?.beatsPerBar || 4;
      // Assuming resolution is ticks per WHOLE note, and beatUnit defines the beat
      return beatsPerBar * (resolution / (timeSignature?.beatUnit || 4)); 
    }
    return Object.values(songData).reduce((acc, bar) => {
        return acc + (bar?.length || NUM_BEATS_PER_BAR);
    }, 0);
  }, [songData, NUM_BEATS_PER_BAR, resolution, timeSignature]);

  useEffect(() => {
    if (appMode === MODE_SYNC && mediaElement && audioContextRef.current && audioContextRef.current.state === 'running') {
      if (sourceNodeRef.current) { 
        try { sourceNodeRef.current.disconnect(); } 
        catch(e) { console.warn("Error disconnecting previous media element source", e); }
      }
      try {
        const source = audioContextRef.current.createMediaElementSource(mediaElement);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 1024; 
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        sourceNodeRef.current = source; 
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        if (e.name !== 'InvalidStateError') { 
            console.error("[AudioBeatVisualizer] Error setting up AnalyserNode:", e);
        }
        analyserRef.current = null;
      }
    }
    return () => {
        if(sourceNodeRef.current) {
            try { sourceNodeRef.current.disconnect(); } catch(e) {/*ignore*/}
            sourceNodeRef.current = null;
        }
        if(analyserRef.current) {
            try { analyserRef.current.disconnect(); } catch(e) {/*ignore*/}
            analyserRef.current = null;
        }
    };
  }, [appMode, mediaElement]); 


  const draw = useCallback((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(20, 20, 25, 0.7)'; 
    ctx.fillRect(0, 0, width, height);

    const padding = 1; 
    const drawableWidth = width - 2 * padding;
    const drawableHeight = height - 2 * padding;

    if (appMode === MODE_SYNC && mediaDuration > 0) {
      const progress = mediaCurrentTime / mediaDuration;
      ctx.fillStyle = 'rgba(70, 70, 80, 0.8)'; 
      ctx.fillRect(padding, padding, drawableWidth, drawableHeight);
      ctx.fillStyle = 'rgba(var(--color-brand-sync-rgb, 168, 85, 247), 0.7)'; 
      ctx.fillRect(padding, padding, drawableWidth * progress, drawableHeight);

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(var(--color-brand-accent-rgb, 0, 242, 234), 0.5)'; 
        ctx.beginPath();
        const sliceWidth = drawableWidth / dataArrayRef.current.length;
        let x = padding;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const v = dataArrayRef.current[i] / 128.0; 
          const y = (v * drawableHeight / 2) + padding; 
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }
      
      if (loopStartGlobalTick !== null && loopEndGlobalTick !== null && totalTicksInSong > 0 && mediaDuration > 0) {
          const ticksPerSec = totalTicksInSong / mediaDuration; 
          const loopStartTime = ticksPerSec > 0 ? loopStartGlobalTick / ticksPerSec : 0;
          const loopEndTime = ticksPerSec > 0 ? loopEndGlobalTick / ticksPerSec : 0;
          const startX = padding + (loopStartTime / mediaDuration) * drawableWidth;
          const endX = padding + (loopEndTime / mediaDuration) * drawableWidth;
          if (endX > startX) { 
            ctx.fillStyle = 'rgba(250, 204, 21, 0.3)'; 
            ctx.fillRect(startX, padding, endX - startX, drawableHeight);
          }
          ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; 
          ctx.fillRect(startX - 1, padding, 3, drawableHeight); 
          ctx.fillRect(endX - 1, padding, 3, drawableHeight);   
      }
    } else { 
      if (totalTicksInSong <= 0) return;
      const tickWidth = drawableWidth / totalTicksInSong;
      let currentGlobalTickAbsolute = sequencerCurrentBeatIndex;
      for(let i = 1; i < sequencerCurrentBar; i++) {
        currentGlobalTickAbsolute += (songData?.[i]?.length || NUM_BEATS_PER_BAR);
      }

      for (let i = 0; i < totalTicksInSong; i++) {
        const xPos = padding + i * tickWidth;
        let barIndexOfTick = 0; 
        let cumulativeTicksForBarCalc = 0;
        for(let barNum = 1; barNum <= Object.keys(songData).length; barNum++){
            const ticksInThisBar = songData[barNum]?.length || NUM_BEATS_PER_BAR;
            if(i < cumulativeTicksForBarCalc + ticksInThisBar){ 
                barIndexOfTick = barNum -1; 
                break; 
            }
            cumulativeTicksForBarCalc += ticksInThisBar;
        }
        
        const ticksPerBeat = resolution / (timeSignature.beatUnit || 4);
        const isBeatStart = ticksPerBeat > 0 ? i % ticksPerBeat === 0 : false; // Avoid division by zero
        
        let isBarStart = false;
        if (i === 0) {
            isBarStart = true;
        } else {
            let ticksBeforeThisBar = 0;
            // Ensure barIndexOfTick is valid for songData access
            const validBarIndex = Math.min(barIndexOfTick, Object.keys(songData).length -1);
            for (let barNumIdx = 0; barNumIdx < validBarIndex; barNumIdx++) { 
                 ticksBeforeThisBar += (songData[Object.keys(songData)[barNumIdx]]?.length || NUM_BEATS_PER_BAR);
            }
            if (i === ticksBeforeThisBar && barIndexOfTick > 0) isBarStart = true; // Check if it's the start of subsequent bars
        }

        ctx.fillStyle = 'rgba(55, 65, 81, 0.6)'; 
        if (isBarStart) ctx.fillStyle = 'rgba(107, 114, 128, 0.7)'; 
        else if (isBeatStart) ctx.fillStyle = 'rgba(75, 85, 99, 0.7)'; 
        
        if (loopStartGlobalTick !== null && loopEndGlobalTick !== null && i >= loopStartGlobalTick && i <= loopEndGlobalTick) {
            if (appMode === MODE_SEQ) ctx.fillStyle = 'rgba(var(--color-brand-seq-rgb, 59, 130, 246), 0.3)';
            else if (appMode === MODE_POS) ctx.fillStyle = 'rgba(var(--color-brand-pos-rgb, 250, 204, 21), 0.3)';
            else  ctx.fillStyle = 'rgba(100, 100, 110, 0.3)'; 
        }
        ctx.fillRect(xPos, padding, Math.max(1, tickWidth -1), drawableHeight);

        if (isPlaying && i === currentGlobalTickAbsolute) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; 
          ctx.fillRect(xPos - 1, 0, 3, height); 
        } else if (!isPlaying && i === currentGlobalTickAbsolute && sequencerWasActive) {
            ctx.fillStyle = 'rgba(200, 200, 200, 0.8)'; 
            ctx.fillRect(xPos -1, padding, 2, drawableHeight);
        }
      }
      if (loopStartGlobalTick !== null && loopEndGlobalTick !== null && totalTicksInSong > 0) {
          const startX = padding + (loopStartGlobalTick / totalTicksInSong) * drawableWidth;
          const endX = padding + (loopEndGlobalTick / totalTicksInSong) * drawableWidth;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; 
          ctx.fillRect(startX - 1, padding, 3, drawableHeight); 
          ctx.fillRect(endX -1, padding, 3, drawableHeight);  
      }
    }
  }, [
    appMode, mediaElement, mediaCurrentTime, mediaDuration, analyserRef, dataArrayRef, 
    sequencerCurrentBar, sequencerCurrentBeatIndex, songData, 
    NUM_BEATS_PER_BAR, resolution, timeSignature, 
    totalTicksInSong, isPlaying, sequencerWasActive, 
    loopStartGlobalTick, loopEndGlobalTick
  ]);

  const animationLoop = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    draw(ctx, canvas.width, canvas.height);
    if (isPlaying || (appMode === MODE_SYNC && mediaElement && !mediaElement.paused && analyserRef.current)) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [draw, isPlaying, appMode, mediaElement]); 

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    let observer;
    const handleResize = () => {
      if (!canvas || !parent) return;
      // Ensure parent has valid dimensions before setting canvas size
      if (parent.offsetWidth > 0 && parent.offsetHeight > 0) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        const ctx = canvas.getContext('2d');
        draw(ctx, canvas.width, canvas.height);
      }
    };
    if (parent) { 
        // Initial size set might happen too early if parent dimensions are not yet stable.
        // Using requestAnimationFrame or a small timeout can help.
        requestAnimationFrame(() => {
            if (parent.offsetWidth > 0 && parent.offsetHeight > 0) { // Check again before initial call
                handleResize();
            }
        });
        observer = new ResizeObserver(handleResize); 
        observer.observe(parent); 
    }
    window.addEventListener('resize', handleResize);
    return () => { 
        window.removeEventListener('resize', handleResize); 
        if (observer && parent) observer.unobserve(parent); 
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draw]); 

  useEffect(() => {
    if (canvasRef.current) {
        const canvas = canvasRef.current;
        if (canvas.width > 0 && canvas.height > 0) { // Ensure canvas has dimensions
            const ctx = canvas.getContext('2d');
            draw(ctx, canvas.width, canvas.height); 
        }
    }
    if (isPlaying || (appMode === MODE_SYNC && mediaElement && !mediaElement.paused && analyserRef.current)) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        if (canvas.width > 0 && canvas.height > 0) { // Ensure canvas has dimensions
            const ctx = canvas.getContext('2d');
            draw(ctx, canvas.width, canvas.height);
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, appMode, mediaElement, animationLoop, draw, mediaCurrentTime, sequencerCurrentBar, sequencerCurrentBeatIndex, loopStartGlobalTick, loopEndGlobalTick, sequencerWasActive, songData, timeSignature, resolution, NUM_BEATS_PER_BAR]);


  const handleCanvasClick = useCallback((e) => {
    if (!onSeek || !canvasRef.current || (appMode !== MODE_SYNC && totalTicksInSong <= 0) || (appMode === MODE_SYNC && mediaDuration <=0) ) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, x / rect.width)); 

    if (appMode === MODE_SYNC && mediaDuration > 0) {
        const targetMediaTime = clickRatio * mediaDuration;
        onSeek({ type: 'time', value: targetMediaTime });
    } else if (totalTicksInSong > 0) { 
        const targetGlobalTick = Math.floor(clickRatio * totalTicksInSong);
        onSeek({ type: 'tick', value: targetGlobalTick });
    }
  }, [onSeek, appMode, mediaDuration, totalTicksInSong]);

  return (
    <div 
        className="w-full h-full bg-gray-900/70 rounded-md overflow-hidden shadow-inner" 
        title="Timeline Visualizer / Click to Seek"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        aria-label="Audio timeline visualizer"
      />
    </div>
  );
};

AudioBeatVisualizer.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  appMode: PropTypes.string.isRequired,
  timeSignature: PropTypes.shape({ beatsPerBar: PropTypes.number, beatUnit: PropTypes.number }).isRequired,
  mediaElement: PropTypes.instanceOf(HTMLMediaElement),
  mediaDuration: PropTypes.number,
  mediaCurrentTime: PropTypes.number,
  sequencerCurrentBar: PropTypes.number.isRequired,
  sequencerCurrentBeatIndex: PropTypes.number.isRequired, 
  songData: PropTypes.object.isRequired,
  NUM_BEATS_PER_BAR: PropTypes.number.isRequired, 
  resolution: PropTypes.number.isRequired, 
  sequencerWasActive: PropTypes.bool.isRequired,
  onSeek: PropTypes.func, 
  loopStartGlobalTick: PropTypes.number,
  loopEndGlobalTick: PropTypes.number,
};

export default AudioBeatVisualizer;