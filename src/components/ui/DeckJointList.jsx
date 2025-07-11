import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { VISIBLE_JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import PivotControl from './PivotControl';
import classNames from 'classnames';
import './DeckJointList.css';

const DeckJointList = ({ side }) => {
    const { selectedJoints, setSelectedJoints } = useUIState();
    
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = VISIBLE_JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    const handleShortClick = (jointId) => {
        setSelectedJoints(prev => (prev.length === 1 && prev[0] === jointId) ? [] : [jointId]);
    };

    const handleLongPress = (jointId) => {
        if (jointId === 'LF' || jointId === 'RF') {
            setSelectedJoints(['LF', 'RF']);
            return;
        }
        const counterpart = jointId.startsWith('L') ? `R${jointId.substring(1)}` : `L${jointId.substring(1)}`;
        setSelectedJoints([jointId, counterpart]);
    };

    return (
        <div className="deck-joint-list-container">
            <div className="joint-buttons-wrapper">
                {jointsForSide.map(joint => {
                    const isSelected = selectedJoints.includes(joint.id);
                    const longPressEvents = useLongPress(() => handleShortClick(joint.id), () => handleLongPress(joint.id));
                    
                    const isFootButton = joint.id === 'LF' || joint.id === 'RF';

                    return (
                        <React.Fragment key={joint.id}>
                            <button 
                                className={classNames('joint-list-btn', { 'selected': isSelected })}
                                {...longPressEvents}
                            >
                                {joint.id}
                            </button>
                            {isFootButton && <PivotControl side={side} />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default DeckJointList;