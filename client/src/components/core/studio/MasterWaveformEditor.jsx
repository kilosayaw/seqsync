import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { X } from 'react-feather';
import { useSequence } from '../../../contexts/SequenceContext';
import { usePlayback } from '../../../contexts/PlaybackContext';

// --- STYLED COMPONENTS ---
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
const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3`
  color: white; font-weight: bold; font-size: 1.25rem;
`;
const CanvasContainer = styled.div`
  position: relative; width: 100%; height: 200px;
  background-color: #0f172a; border-radius: 8px; overflow: hidden;
`;
const Canvas = styled.canvas`
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
`;
const Playhead = styled.div`
  position: absolute; top: 0; left: 80px; /* Fixed position for alignment target */
  height: 100%; width: 2px;
  background-color: var(--color-accent-yellow, #FFD700);
  box-shadow: 0 0 8px var(--color-accent-yellow);
  pointer-events: none;
`;
const WaveformWrapper = styled.div`
    position: absolute; top: 0; height: 100%; width: 100%;
    cursor: ew-resize;
`;
const DoneButton = styled.button`
    padding: 10px 20px; border-radius: 6px; border: none; 
    background-color: var(--color-accent); color: white; 
    cursor: pointer; align-self: flex-end; font-weight: bold;
    &:hover { background-color: var(--color-accent-light); }
`;

// --- THE COMPONENT ---
const MasterWaveformEditor = ({ onClose }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { songData, setGridStartTime } = useSequence();
    const { bpm } = usePlayback();
    const [offsetPx, setOffsetPx] = useState(0);
    

    // Set initial offset from context when the modal opens
    useEffect(() => {
        if (songData.gridOffset && songData.audioBuffer && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const px = (songData.gridOffset / songData.audioBuffer.duration) * containerWidth;
            setOffsetPx(px);
        }
    }, [songData.gridOffset, songData.audioBuffer]);

    // Draw the waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!songData.audioBuffer || !canvas || !container) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const data = songData.audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / rect.width);
        const amp = rect.height / 2;
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        for (let i = 0; i < rect.width; i++) {
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
    }, [songData.audioBuffer, containerRef.current]);

    // Handle dragging interaction
    const handleMouseDown = useCallback((e) => {
        const startX = e.clientX;
        const startOffset = offsetPx;
        
        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            setOffsetPx(startOffset + dx);
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [offsetPx]);

    const handleDone = () => {
        if (!containerRef.current || !songData.audioBuffer) return;
        const PLAYHEAD_POSITION_PX = 80;
        const containerWidth = containerRef.current.clientWidth;
        const duration = songData.audioBuffer.duration;
        // Calculate the new start time based on the drag offset
        const newOffsetInSeconds = ((PLAYHEAD_POSITION_PX - offsetPx) / containerWidth) * duration;
        
        // Update the global state in the context
        setGridStartTime(Math.max(0, newOffsetInSeconds)); 
        
        // Close the modal
        onClose();
    };
    
    if (!songData.audioBuffer) {
        return (
             <EditorModal onClick={onClose}>
            <EditorContainer onClick={e => e.stopPropagation()}>
                    <ModalHeader>
                       <ModalTitle>Error</ModalTitle>
                       <X onClick={onClose} cursor="pointer"/>
                    </ModalHeader>
                    <p>No audio file loaded. Please load an audio file first to use the Nudge tool.</p>
                <DoneButton onClick={handleDone}>Done</DoneButton>
            </EditorContainer>
            </EditorModal>
        )
    }

    return (
        <EditorModal onClick={onClose}>
            <EditorContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Align Grid Start</ModalTitle>
                    <p className="text-sm text-slate-400">Drag the waveform to align a transient with the yellow playhead.</p>
                </ModalHeader>
                <CanvasContainer ref={containerRef}>
                    <WaveformWrapper style={{ left: `${offsetPx}px` }} onMouseDown={handleMouseDown}>
                       <Canvas ref={canvasRef} />
                    </WaveformWrapper>
                    <Playhead />
                </CanvasContainer>
                <DoneButton onClick={handleDone}>Done</DoneButton>
            </EditorContainer>
        </EditorModal>
    );
};

MasterWaveformEditor.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default MasterWaveformEditor;