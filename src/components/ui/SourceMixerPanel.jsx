// src/components/ui/SourceMixerPanel.jsx
import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './SourceMixerPanel.css';

const SourceMixerPanel = () => {
    const { activePanel, setActivePanel, mixerState, setMixerState } = useSequence();

    const isVisible = activePanel === 'mixer';

    const handleToggle = (track) => {
        setMixerState(prevState => ({
            ...prevState,
            [track]: !prevState[track]
        }));
    };

    const handleOpacityChange = (e) => {
        const newOpacity = parseFloat(e.target.value);
        setMixerState(prevState => ({
            ...prevState,
            motionOverlayOpacity: newOpacity
        }));
    };

    if (!mixerState) return null;

    return (
        <div className={classNames('source-mixer-panel', { 'visible': isVisible })}>
            <div className="panel-header">
                <h3>SOURCE MIXER</h3>
                <button className="close-btn" onClick={() => setActivePanel('none')}>×</button>
            </div>
            <div className="panel-content">
                <div className="mixer-track">
                    <span className="track-label">Kit Sounds</span>
                    <button onClick={() => handleToggle('kitSounds')} className={classNames('mute-btn', { 'active': mixerState.kitSounds })}>
                        {mixerState.kitSounds ? 'ON' : 'MUTED'}
                    </button>
                </div>
                <div className="mixer-track">
                    <span className="track-label">Uploaded Media (Cues)</span>
                    <button onClick={() => handleToggle('uploadedMedia')} className={classNames('mute-btn', { 'active': mixerState.uploadedMedia })}>
                        {mixerState.uploadedMedia ? 'ON' : 'MUTED'}
                    </button>
                </div>
                 <div className="mixer-track">
                    <span className="track-label">Camera Feed</span>
                    <button onClick={() => handleToggle('cameraFeed')} className={classNames('mute-btn', { 'active': mixerState.cameraFeed })}>
                        {mixerState.cameraFeed ? 'ON' : 'OFF'}
                    </button>
                </div>
                 <div className="mixer-track motion-overlay-track">
                    <span className="track-label">Motion Overlay (Onion Skin)</span>
                    <div className="track-controls">
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={mixerState.motionOverlayOpacity} 
                            onChange={handleOpacityChange}
                            disabled={!mixerState.motionOverlay}
                        />
                        <button onClick={() => handleToggle('motionOverlay')} className={classNames('mute-btn', { 'active': mixerState.motionOverlay })}>
                            {mixerState.motionOverlay ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SourceMixerPanel;