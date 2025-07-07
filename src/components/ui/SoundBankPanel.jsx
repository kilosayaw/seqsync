// src/components/ui/SoundBankPanel.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import classNames from 'classnames';
import './SoundBankPanel.css';

const SoundBankPanel = () => {
    const { activePanel, setActivePanel } = useUIState();

    const isVisible = activePanel === 'sound';

    const panelClasses = classNames('sound-bank-panel', {
        'visible': isVisible,
    });

    return (
        <div className={panelClasses}>
            <div className="panel-header">
                <h3>SOUND BANK</h3>
                <button className="close-btn" onClick={() => setActivePanel('none')}>×</button>
            </div>
            <div className="panel-content">
                <p>Kit and Sound selection UI will go here.</p>
            </div>
        </div>
    );
};
export default SoundBankPanel;