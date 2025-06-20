// /client/src/components/core/sequencer/BeatWaveform.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const BeatWaveform = ({ points }) => {
    const pathData = useMemo(() => {
        if (!points || points.length === 0) return '';
        const width = 100;
        const height = 50;
        const step = width / (points.length - 1);
        
        let path = `M 0,${height / 2}`;
        points.forEach((point, i) => {
            const x = i * step;
            const y = (point * (height / 2));
            path += ` L ${x},${(height / 2) - y}`;
        });
        
        let lowerPath = ` L ${width},${height / 2}`;
        [...points].reverse().forEach((point, i) => {
            const x = (points.length - 1 - i) * step;
            const y = (point * (height / 2));
            lowerPath += ` L ${x},${(height / 2) + y}`;
        });

        return path + lowerPath + ' Z';
    }, [points]);

    if (!pathData) return null;

    return (
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d={pathData} className="fill-brand-seq/70" />
        </svg>
    );
};

BeatWaveform.propTypes = {
    points: PropTypes.arrayOf(PropTypes.number),
};

export default React.memo(BeatWaveform);