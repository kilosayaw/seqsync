// src/components/ui/TransportControls.jsx
import React from 'react';
import { useMedia } from '../../context/MediaContext';
import styles from './TransportControls.module.css';

const TransportControls = () => {
    const { isPlaying, isRecording, togglePlay, handleRecord } = useMedia();
    return (
        <div className={styles.transportContainer}>
            <button className={styles.transportButton}>{'<<'}</button>
            <button className={styles.transportButton}>{'<'}</button>
            <button className={`${styles.transportButton} ${styles.playButton} ${isPlaying ? styles.active : ''}`} onClick={togglePlay}>
                {isPlaying ? '❚❚' : '▶'}
            </button>
            <button className={styles.transportButton}>{'>'}</button>
            <button className={styles.transportButton}>{'>>'}</button>
            <button className={`${styles.recordButton} ${isRecording ? styles.active : ''}`} onClick={handleRecord}>●</button>
        </div>
    );
};
export default TransportControls;