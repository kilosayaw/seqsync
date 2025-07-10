import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './PresetPageSelectors.css'; // Import the stylesheet

const PresetPageSelectors = ({ side }) => {
    const { activePresetPage, setActivePresetPage } = useUIState();

    const handlePageChange = (pageIndex) => {
        setActivePresetPage(prev => ({ ...prev, [side]: pageIndex }));
    };

    return (
        <div className="preset-page-selectors">
            {[0, 1, 2].map(i => (
                <button
                    key={`page-${i}`}
                    className={classNames('page-btn', { 'active': activePresetPage[side] === i })}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default PresetPageSelectors;