import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const BeatWaveform = ({ waveformPoints, color = 'var(--color-accent, #00AACC)' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!waveformPoints || waveformPoints.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        const step = width / waveformPoints.length;
        const halfHeight = height / 2;

        waveformPoints.forEach((val, i) => {
            const x = i * step;
            const y = val * halfHeight; // Scale amplitude to canvas height
            
            ctx.moveTo(x, halfHeight - y);
            ctx.lineTo(x, halfHeight + y);
        });

        ctx.stroke();

    }, [waveformPoints, color]);

    return <Canvas ref={canvasRef} width="100" height="100" />;
};

BeatWaveform.propTypes = {
    waveformPoints: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.string,
};

export default React.memo(BeatWaveform);