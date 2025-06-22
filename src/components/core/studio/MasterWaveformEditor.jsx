import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useSequence } from '../../../contexts/SequenceContext';
import { usePlayback } from '../../../contexts/PlaybackContext';

const EditorModal = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.9);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(5px);
`;

const EditorContainer = styled.div`
  background-color: #1e293b; padding: 1.5rem; border-radius: 12px;
  width: 90%; max-width: 900px; display: flex; flex-direction: column;
  gap: 1rem; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const CanvasContainer = styled.div`
  position: relative; width: 100%; height: 200px;
  background-color: #0f172a; border-radius: 8px; cursor: ew-resize;
`;

const Canvas = styled.canvas` width: 100%; height: 100%; `;

const GridLine = styled.div`
  position: absolute; top: 0; height: 100%; width: 1px;
  background-color: ${({ isDownbeat }) => isDownbeat ? 'rgba(255, 100, 100, 0.5)' : 'rgba(0, 200, 255, 0.2)'};
  pointer-events: none;
`;

// --- FIX: Create a more substantial, grabbable handle ---
const PlayheadHandle = styled.div`
  position: absolute; top: 0; left: -8px; /* Center the handle on the line */
  height: 100%; width: 16px;
  background-color: transparent;
  cursor: ew-resize;
  display: flex;
  justify-content: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: 2px;
    background-color: var(--color-accent-yellow, #FFD700);
  }
`;

const MasterWaveformEditor = ({ onClose }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { songData, setGridStartTime } = useSequence();
    const { bpm } = usePlayback();
    
    const [offsetPx, setOffsetPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Draw the full waveform
    useEffect(() => {
        if (!songData.audioBuffer || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const data = songData.audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
            let min = 1.0; let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
    }, [songData.audioBuffer]);
    
    // Set initial offset on mount
    useEffect(() => {
        if (songData.gridOffset && songData.audioBuffer && containerRef.current) {
            const width = containerRef.current.clientWidth;
            const px = (songData.gridOffset / songData.audioBuffer.duration) * width;
            setOffsetPx(px);
        }
    }, [songData.gridOffset, songData.audioBuffer]);

    // --- FIX: Implement the full drag logic ---
    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        const startX = e.clientX;
        const startOffset = offsetPx;
        const containerWidth = containerRef.current.getBoundingClientRect().width;

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            // Constrain the drag within the container bounds
            const newOffset = Math.max(0, Math.min(containerWidth, startOffset + dx));
            setOffsetPx(newOffset);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [offsetPx]);

    const handleDone = () => {
        if (!containerRef.current || !songData.audioBuffer) return;
        const width = containerRef.current.clientWidth;
        const duration = songData.audioBuffer.duration;
        const newOffsetInSeconds = (offsetPx / width) * duration;
        setGridStartTime(newOffsetInSeconds);
        onClose();
    };

    const gridLines = [];
    if (bpm > 0 && containerRef.current && songData.audioBuffer) {
        const width = containerRef.current.clientWidth;
        const timePerBeat = 60 / bpm;
        const numBeats = Math.floor(songData.audioBuffer.duration / timePerBeat);
        for (let i = 0; i < numBeats; i++) {
            const beatTime = i * timePerBeat;
            const left = ((beatTime / songData.audioBuffer.duration) * width);
            if (left > width) break;
            gridLines.push(<GridLine key={i} style={{ left: `${left}px` }} isDownbeat={i % 4 === 0} />);
        }
    }

    return (
        <EditorModal>
            <EditorContainer>
                <h3 style={{color: 'white', margin: 0}}>Align Grid Start</h3>
                <p style={{color: '#94a3b8', margin: 0, fontSize: '0.9rem'}}>Drag the waveform to align the first transient with the yellow playhead.</p>
                <CanvasContainer ref={containerRef}>
                    <div style={{ position: 'absolute', top: 0, left: `${-offsetPx}px`, width: '100%', height: '100%' }}>
                        <Canvas ref={canvasRef} width="800" height="200" />
                        {gridLines}
                    </div>
                    <PlayheadHandle onMouseDown={handleMouseDown} />
                </CanvasContainer>
                <button onClick={handleDone} style={{padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-accent)', color: 'white', cursor: 'pointer', alignSelf: 'flex-end'}}>Done</button>
            </EditorContainer>
        </EditorModal>
    );
};

MasterWaveformEditor.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default MasterWaveformEditor;