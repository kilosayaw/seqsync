// src/components/ui/PerformancePad.jsx
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { useLongPress } from '../../hooks/useLongPress';
import './PerformancePad.css';

// This is the Chevron Icon sub-component. It is unchanged but necessary.
const ChevronIcon = ({ position }) => {
    if (!position) return null;
    const [x, y] = position;
    // Calculate rotation angle from the (x,y) vector. Adding 90 degrees to align 'up' correctly.
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const style = { transform: `rotate(${angle}deg)` };
    return <div className="chevron-icon" style={style}>›</div>;
};

const PerformancePad = ({ padIndex, beatNum, isPulsing, isSelected, onMouseDown, onMouseUp, onMouseLeave, side }) => {
    const { activePad, activePresetPage, showNotification } = useUIState();
    const { songData, savePoseToPreset } = useSequence();
    
    // The long press logic for saving presets is unchanged.
    const handleLongPress = () => {
        if (activePad === null) {
            showNotification("Select a pad to save a pose from.", 2000);
            return;
        }
        const presetIndex = side === 'left' ? padIndex % 4 : (padIndex % 8) - 4;
        const pageIndex = activePresetPage[side];
        savePoseToPreset(side, pageIndex, presetIndex);
        showNotification(`Pose saved to ${side.toUpperCase()} Preset Page ${pageIndex + 1}, Slot ${presetIndex + 1}.`, 2000);
    };
    const longPressEvents = useLongPress(() => {}, handleLongPress, { ms: 500 });
    
    const padClasses = classNames('performance-pad', { 'pulsing': isPulsing, 'selected': isSelected });

    // --- DEFINITIVE FIX: Logic to find the FORCE joint and its data ---
    const beatData = songData[padIndex];
    let forceJointDisplay = null;
    if (beatData?.joints) {
        // Find the ID of any joint on this beat that is set to 'FORCE'
        const forceJointId = Object.keys(beatData.joints).find(
            id => beatData.joints[id]?.intentType === 'FORCE'
        );
        
        // If we found one, prepare its data for display
        if (forceJointId) {
            const jointData = beatData.joints[forceJointId];
            forceJointDisplay = {
                abbr: forceJointId,
                position: jointData.position, // Get the position for the chevron direction
            };
        }
    }

    return (
        <button 
            className={padClasses} 
            onMouseDown={(e) => { onMouseDown(e); longPressEvents.onMouseDown(e); }} 
            onMouseUp={(e) => { onMouseUp(e); longPressEvents.onMouseUp(e); }} 
            onMouseLeave={(e) => { onMouseLeave(e); longPressEvents.onMouseLeave(e); }}
        >
            <span className="pad-beat-number">{beatNum}</span>
            
            {/* DEFINITIVE FIX: Render the abbreviation and the chevron icon */}
            {forceJointDisplay && (
                <div className="pad-force-display">
                    <span className="force-abbr">{forceJointDisplay.abbr}</span>
                    <ChevronIcon position={forceJointDisplay.position} />
                </div>
            )}
        </button>
    );
};
export default React.memo(PerformancePad);