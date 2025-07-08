// src/components/ui/CircularBpmControl.jsx
import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { useTapTempo } from '../../hooks/useTapTempo'; // Missing import added
import styles from './CircularBpmControl.module.css';

const CircularBpmControl = () => {
    const { bpm, updateBpm } = useMedia();
    const { tap } = useTapTempo(updateBpm); // Use the tap tempo hook

    return (
        <div className={styles.bpmControl} onClick={tap}>
            <div className={styles.bpmDisplay}>{bpm}</div>
            <div className={styles.label}>BPM</div>
        </div>
    );
};

export default CircularBpmControl;