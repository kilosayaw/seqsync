import React, { useState } from 'react';
import classNames from 'classnames';
import { useUIState } from '../context/UIStateContext';
import { JOINT_LIST } from '../utils/constants';
import { useLongPress } from '../hooks/useLongPress';
import './DeckJointList.css';

const JointButton = ({ joint, isSelected, onSelect, onLongPress }) => {
    const [syncState, setSyncState] = useState('none');
    const handleClick = () => onSelect(joint.id);
    const handleLongPress = () => {
        setSyncState(prev => {
            if (prev === 'none') return 'dupe';
            if (prev === 'dupe') return 'alt';
            return 'none';
        });
        onLongPress(joint.id);
    };
    const longPressEvents = useLongPress(handleClick, handleLongPress);
    const btnClasses = classNames('joint-list-btn', {
        'selected': isSelected, 'dupe-sync': syncState === 'dupe', 'alt-sync': syncState === 'alt',
    });
    return <button className={btnClasses} {...longPressEvents}>{joint.name}</button>;
};

const DeckJointList = ({ side }) => {
    const { selectedJoint, setSelectedJoint } = useUIState();
    // This line, which caused the crash, will now receive a defined 'side' prop.
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    return (
        <div className="deck-joint-list-container">
            {jointsForSide.map(joint => (
                <JointButton 
                    key={joint.id} joint={joint}
                    isSelected={selectedJoint === joint.id}
                    onSelect={setSelectedJoint}
                    onLongPress={(id) => console.log(`Long-pressed ${id}`)}
                />
            ))}
        </div>
    );
};

export default DeckJointList;