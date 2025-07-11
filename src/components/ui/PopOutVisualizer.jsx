// src/components/ui/PopOutVisualizer.jsx
import React from 'react';
import NewWindow from 'react-new-window';
import P5SkeletalVisualizer from '../media/P5SkeletalVisualizer';
import SmallTransportControls from './SmallTransportControls';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { convertPoseToVisualizerFormat } from '../../utils/poseUtils';

const PopOutVisualizer = () => {
    const { setIsVisualizerPoppedOut, activePad, selectedJoints, animationState, animationRange } = useUIState();
    const { songData } = useSequence();

    // Get and convert pose data, same as in MediaDisplay
    const activeSequencePose = activePad !== null ? songData[activePad] : null;
    const startSequencePose = animationRange.start !== null ? songData[animationRange.start] : null;
    const endSequencePose = animationRange.end !== null ? songData[animationRange.end] : null;

    const activePose = convertPoseToVisualizerFormat(activeSequencePose);
    const startPose = convertPoseToVisualizerFormat(startSequencePose);
    const endPose = convertPoseToVisualizerFormat(endSequencePose);

    return (
        <NewWindow
            onUnload={() => setIsVisualizerPoppedOut(false)}
            title="SĒQsync Visualizer"
            features={{ width: 600, height: 600 }}
        >
            <div style={{ background: '#000', width: '100%', height: '100vh', position: 'relative' }}>
                <P5SkeletalVisualizer
                    startPose={startPose}
                    endPose={endPose}
                    animationState={animationState}
                    highlightJoints={selectedJoints}
                    width={600}
                    height={600}
                />
                <SmallTransportControls />
            </div>
        </NewWindow>
    );
};

export default PopOutVisualizer;