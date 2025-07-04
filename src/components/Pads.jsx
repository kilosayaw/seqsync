import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { usePadMapping } from '../hooks/usePadMapping';
import './PerformancePad.css';

const Pads = ({ side }) => {
    const { selectedBar, selectedBeat, activePad, handlePadDown, handlePadUp } = useUIState();
    const { isPlaying, activeBeat, currentBar } = usePlayback();
    const { playheadPadIndex } = usePadMapping(selectedBar, activeBeat, currentBar);

    const padOffset = side === 'left' ? 0 : 8; // Left deck shows pads 0-7, Right shows 8-15

    return (
        <div className="pads-section">
            <div className="pads-grid">
                {Array.from({ length: 8 }).map((_, index) => {
                    const padIndex = padOffset + index; // Calculate the global pad index (0-15)

                    const isPlayheadOnPad = isPlaying && padIndex === playheadPadIndex;
                    const isUserPressingPad = padIndex === activePad;
                    const isSelectedForEdit = padIndex === selectedBeat;

                    const padClasses = classNames('performance-pad', {
                        'active': isPlayheadOnPad,
                        'user-active': isUserPressingPad,
                        'selected': isSelectedForEdit && !isUserPressingPad,
                    });

                    return (
                        <div
                            key={padIndex}
                            className={padClasses}
                            onMouseDown={() => handlePadDown(padIndex)}
                            onMouseUp={() => handlePadUp(padIndex)}
                            onMouseLeave={() => handlePadUp(padIndex)}
                        >
                            <span className="pad-number">{padIndex + 1}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Pads;