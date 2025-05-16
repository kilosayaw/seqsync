// client/src/components/NotationBuilder/AudioPlayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import MusicTempo from 'music-tempo';

const AudioPlayer = ({ onTimeUpdate, onReady, onBpmDetected }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    wavesurferRef.current.load(objectUrl);

    // Auto-detect BPM
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0); // use first channel
    const peaks = getPeaks(channelData, 1024); // resolution: 1024 samples per slice
    const mt = new MusicTempo(peaks);

    console.log("🎵 Detected BPM:", mt.tempo);
    if (onBpmDetected) onBpmDetected(mt.tempo);
  };

  const getPeaks = (data, sliceSize) => {
    const peaks = [];
    for (let i = 0; i < data.length; i += sliceSize) {
      let max = 0;
      for (let j = 0; j < sliceSize && i + j < data.length; j++) {
        const val = Math.abs(data[i + j]);
        if (val > max) max = val;
      }
      peaks.push(max);
    }
    return peaks;
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ccc',
      progressColor: '#1d4ed8',
      cursorColor: '#000',
      barWidth: 2,
      height: 80,
      responsive: true,
    });

    wavesurferRef.current.on('audioprocess', (time) => {
      if (onTimeUpdate) onTimeUpdate(time * 1000);
    });

    wavesurferRef.current.on('ready', () => {
      if (onReady) onReady(wavesurferRef.current.getDuration() * 1000);
    });

    return () => wavesurferRef.current?.destroy();
  }, []);

  return (
    <div className="mb-6">
      <input type="file" accept="audio/*" onChange={handleFileUpload} className="mb-2" />
      <div ref={waveformRef} className="w-full bg-gray-100 rounded shadow-sm"></div>
      <button
        onClick={togglePlay}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioPlayer;
