// src/components/ui/BarBeatDisplay.jsx
import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { useMedia } from '../../context/MediaContext';
import styles from './BarBeatDisplay.module.css';

const BarBeatDisplay = () => {
    // All state from new hooks
    const { currentBar, totalBars, goToPrevBar, goToNextBar } = useSequence();
    const { currentBeat, bpm } = useMedia();

    return (
        <div className={styles.container}>
            <div className={styles.barDisplay}>
                <button onClick={goToPrevBar} disabled={currentBar <= 1} className={styles.navButton}>{'<'}</button>
                <div className={styles.barText}>BAR <span className={styles.barNumber}>{String(currentBar).padStart(2, '0')}</span> / {totalBars}</div>
                <button onClick={goToNextBar} disabled={currentBar >= totalBars} className={styles.navButton}>{'>'}</button>
            </div>
            <div className={styles.timeInfo}>
                <div className={styles.beat}>BEAT: <span className={styles.value}>{currentBeat}</span></div>
                <div className={styles.bpm}>BPM: <span className={styles.value}>{bpm}</span></div>
            </div>
        </div>
    );
};
export default BarBeatDisplay;