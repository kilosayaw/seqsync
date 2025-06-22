import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { X } from 'react-feather';
import { useSequence } from '../../../contexts/SequenceContext';
import { useSequencerSettings } from '../../../contexts/SequencerSettingsContext';

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
  display: flex; justify-content: space-between; align-items: center; color: white;
`;
const CanvasContainer = styled.div`
  position: relative; width: 100%; height: 200px;
  background-color: #0f172a; border-radius: 8px; overflow: hidden;
  cursor: ew-resize;
`;
const Canvas = styled.canvas`
  position: absolute; top: 0; height: 100%;
`;
const Playhead = styled.div`
  position: absolute; top: 0; left: 80px;
  height: 100%; width: 2px;
  background-color: #facc15;
  box-shadow: 0 0 8px #facc15;
  pointer-events: none;
`;
const DoneButton = styled.button`
    padding: 10px 20px; border-radius: 6px; border: none; 
    background-color: #38bdf8; color: white; 
    cursor: pointer; align-self: flex-end; font-weight: bold;
    &:hover { background-color: #7dd3fc; }
`;

const MasterWaveformEditor = ({ onClose }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { songData, setGridStartTime } = useSequence();
    const { bpm } = useSequencerSettings();
    const [offsetPx, setOffsetPx] = useState(0);

    useEffect(() => {
        if (!songData.audioBuffer || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        const data = songData.audioBuffer.getChannelData(0);
        const audioDuration = songData.audioBuffer.duration;
        const canvasWidth = (rect.width * audioDuration) / 5; // Make canvas wider for more scroll room
        
        canvas.width = canvasWidth * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const step = Math.ceil(data.length / canvasWidth);
        const amp = rect.height / 2;
        ctx.clearRect(0, 0, canvasWidth, rect.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        for (let i = 0; i < canvasWidth; i++) {
            let min = 1.0, max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[Math.floor(i * step + j)];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
    }, [songData.audioBuffer]);

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
        const canvasWidth = canvasRef.current.width / (window.devicePixelRatio || 1);
        const duration = songData.audioBuffer.duration;
        const newOffsetInSeconds = ((PLAYHEAD_POSITION_PX - offsetPx) / canvasWidth) * duration;
        setGridStartTime(Math.max(0, newOffsetInSeconds));
        onClose();
    };
    
    if (!songData.audioBuffer) return null;

    return (
        <EditorModal onClick={onClose}>
            <EditorContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h3>Align Grid Start</h3>
                    <X onClick={onClose} cursor="pointer"/>
                </ModalHeader>
                <p className="text-sm text-slate-400 -mt-2">Drag the waveform to align the first transient with the yellow playhead.</p>
                <CanvasContainer ref={containerRef} onMouseDown={handleMouseDown}>
                    <Canvas ref={canvasRef} style={{ left: `${offsetPx}px` }}/>
                    <Playhead />
                </CanvasContainer>
                <DoneButton onClick={handleDone}>Done</DoneButton>
            </EditorContainer>
        </EditorModal>
    );
};

MasterWaveformEditor.propTypes = { onClose: PropTypes.func.isRequired };

export default MasterWaveformEditor;