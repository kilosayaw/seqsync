// src/components/ui/DeckJointList.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import classNames from 'classnames';
import CircularBpmControl from './CircularBpmControl';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoints, setSelectedJoints } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    // Filter out the foot controllers (LF/RF) which are now implicitly handled
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey) && !j.id.endsWith('F'));

    const handleShortClick = (jointId) => {
        setSelectedJoints(prev => (prev.length === 1 && prev[0] === jointId) ? [] : [jointId]);
    };

    const handleLongPress = (jointId) => {
        const counterpart = jointId.startsWith('L') ? `R${jointId.substring(1)}` : `L${jointId.substring(1)}`;
        setSelectedJoints([jointId, counterpart]);
    };

    return (
        <div className="deck-joint-list-container">
            <div className="joint-buttons-wrapper">
                {jointsForSide.map(joint => {
                    const isSelected = selectedJoints.includes(joint.id);
                    const longPressEvents = useLongPress(() => handleShortClick(joint.id), () => handleLongPress(joint.id));
                    
                    return (
                        <button 
                            key={joint.id} 
                            className={classNames('joint-list-btn', { 'selected': isSelected })}
                            {...longPressEvents}
                        >
                            {joint.id}
                        </button>
                    );
                })}
            </div>
            {/* DEFINITIVE: Relocated BPM button to be under the RF joint button */}
            {side === 'right' && (
                <div className="bpm-control-wrapper">
                    <CircularBpmControl />
                </div>
            )}
        </div>
    );
};
export default DeckJointList;