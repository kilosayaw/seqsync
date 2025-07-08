// src/components/ui/DeckJointList.jsx
import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { JOINT_LIST } from '../../utils/constants';
import { useLongPress } from '../../hooks/useLongPress';
import CircularBpmControl from './CircularBpmControl';
import styles from './DeckJointList.module.css';

const DeckJointList = ({ side }) => {
    const { mixerState, setMixerState, selectedJoint, setSelectedJoint } = useSequence();
    const editMode = mixerState.editMode || 'none';
    const sideKey = side.charAt(0).toUpperCase();
    const jointsForSide = JOINT_LIST.filter(j => j.id.startsWith(sideKey));

    return (
        <div className={styles.deckJointListContainer}>
            <div className={styles.jointButtonsWrapper}>
                {jointsForSide.map(joint => {
                    const isFootButton = joint.id.endsWith('F');
                    const isSelected = isFootButton ? (editMode === side || editMode === 'both') : selectedJoint === joint.id;

                    const handleShortClick = () => {
                        setMixerState(s => ({ ...s, editMode: s.editMode === side ? 'none' : side }));
                    };
                    const handleLongPress = () => {
                        setMixerState(s => ({ ...s, editMode: 'both' }));
                    };
                    const handleRegularClick = () => {
                        setSelectedJoint(prev => (prev === joint.id ? null : joint.id));
                    };

                    const longPressEvents = isFootButton ? useLongPress(handleShortClick, handleLongPress) : {};
                    const regularClickEvent = !isFootButton ? { onClick: handleRegularClick } : {};
                    
                    return (
                        <button key={joint.id} className={`${styles.jointListBtn} ${isSelected ? styles.selected : ''}`}
                            {...longPressEvents}
                            {...regularClickEvent}>
                            {joint.id}
                        </button>
                    );
                })}
            </div>
            {side === 'right' && ( <div className={styles.bpmControlWrapper}><CircularBpmControl /></div> )}
        </div>
    );
};
export default DeckJointList;