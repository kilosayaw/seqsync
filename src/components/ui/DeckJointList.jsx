import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import classNames from 'classnames';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoints, setSelectedJoints } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    const handleShortClick = (jointId) => {
        // DEFINITIVE FIX: Added console log as requested.
        console.log(`[Joint Select] Side: ${side}, Joint: ${jointId}`);
        setSelectedJoints(prev => (prev.length === 1 && prev[0] === jointId) ? [] : [jointId]);
    };

    const handleLongPress = (jointId) => {
        if (jointId === 'LF' || jointId === 'RF') {
            console.log(`[Joint Select] Long Press: Both Feet`);
            setSelectedJoints(['LF', 'RF']);
            return;
        }
        const counterpart = jointId.startsWith('L') ? `R${jointId.substring(1)}` : `L${jointId.substring(1)}`;
        console.log(`[Joint Select] Long Press: ${jointId} & ${counterpart}`);
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
            <div className="filler-container"></div>
            <div className="filler-container"></div>
        </div>
    );
};
export default DeckJointList;