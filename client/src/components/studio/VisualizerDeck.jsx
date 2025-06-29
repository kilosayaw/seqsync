// src/components/studio/VisualizerDeck.jsx
import React, { useState, useCallback } from 'react';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useP5PoseAnimator } from '../../../hooks/useP5PoseAnimator';
import { useMedia } from '../../../contexts/MediaContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faArrowsSpin } from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import FootControl from '../grounding/FootControl';
import Crossfader from '../../common/Crossfader';
import SkeletalPoseVisualizer2D from '../pose_editor/SkeletalPoseVisualizer2D';
import CoreDynamicsVisualizer from '../pose_editor/CoreDynamicsVisualizer';
import VideoMediaPlayer from '../media/VideoMediaPlayer';
import RotationKnob from '../../common/RotationKnob';

const VisualizerDeck = () => {
    // --- STATE ---
    const [showCoreVisualizer, setShowCoreVisualizer] = useState(false);
    const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(true);

    // --- CONTEXTS ---
    const { activeBeatData, activeEditingJoint, currentEditingBar, activeBeatIndex } = useUIState();
    const { isPlaying } = usePlayback();
    const { updateBeatDynamics } = useSequence();
    const { mediaUrl, videoPlayerRef } = useMedia();

    // --- ANIMATION ---
    const targetPose = activeBeatData;
    const { animatedPose } = useP5PoseAnimator(targetPose, isPlaying);
    const { jointInfo = {}, grounding = {}, rotation = {} } = animatedPose || targetPose || {};
    
    // --- DERIVED STATE ---
    const hasMedia = !!mediaUrl;
    const crossfaderValueForUI = 100 - (grounding.L_weight ?? 50);
    const weightShiftCurveForUI = jointInfo?.SPIN_L?.rotation ?? 0;

    // --- HANDLERS ---
    const handleGroundingChange = useCallback((side, groundingKey) => {
        const newGrounding = { ...grounding, [side]: groundingKey };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { grounding: newGrounding });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics, grounding]);

    const handleRotationChange = useCallback((side, newRotation) => {
        const newRotationState = { ...rotation, [side]: newRotation };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { rotation: newRotationState });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics, rotation]);

    const handleCrossfaderChange = useCallback((newValue) => {
        const newGrounding = { ...grounding, L_weight: 100 - newValue };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { grounding: newGrounding });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics, grounding]);

    const handleCoreInputChange = useCallback((joint, prop, value) => {
        const newJointData = { ...jointInfo[joint], [prop]: value };
        const newJointInfo = { ...jointInfo, [joint]: newJointData };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { jointInfo: newJointInfo });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics, jointInfo]);

    const handleWeightShiftCurveChange = useCallback((newRotation) => {
        handleCoreInputChange('SPIN_L', 'rotation', newRotation);
    }, [handleCoreInputChange]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 w-full h-full items-center justify-center">
                
                <div className="relative w-full h-full flex justify-center items-center">
                    <FootControl side="L" onGroundingChange={handleGroundingChange} onRotate={handleRotationChange} rotation={rotation.L || 0} />
                </div>
                
                <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                    <div className="relative w-full aspect-square bg-black/20 rounded-lg shadow-inner flex items-center justify-center max-w-[280px]">
                        {showCoreVisualizer ? (
                            <CoreDynamicsVisualizer
                                fullPoseState={jointInfo}
                                onCoreInputChange={handleCoreInputChange}
                                beatGrounding={grounding}
                                className="w-full h-full"
                            />
                        ) : (
                            <>
                                {hasMedia ? <VideoMediaPlayer ref={videoPlayerRef} mediaUrl={mediaUrl} isPlaying={isPlaying} /> : <SkeletalPoseVisualizer2D fullPoseState={jointInfo} highlightJoint={activeEditingJoint} />}
                                {hasMedia && (
                                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showSkeletonOverlay ? 'opacity-100' : 'opacity-0'}`}>
                                        <SkeletalPoseVisualizer2D fullPoseState={jointInfo} highlightJoint={activeEditingJoint} />
                                    </div>
                                )}
                            </>
                        )}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
                            {hasMedia && !showCoreVisualizer && (
                                <Button onClick={() => setShowSkeletonOverlay(s => !s)} variant="icon" className="!bg-black/50 hover:!bg-black/80" title={showSkeletonOverlay ? "Hide Skeleton" : "Show Skeleton"}>
                                    <FontAwesomeIcon icon={showSkeletonOverlay ? faEye : faEyeSlash} />
                                </Button>
                            )}
                            <Button onClick={() => setShowCoreVisualizer(s => !s)} variant="icon" className={`!bg-black/50 hover:!bg-black/80 ${showCoreVisualizer ? 'text-pos-yellow' : ''}`} title="Toggle Core Visualizer">
                                <FontAwesomeIcon icon={faArrowsSpin} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-6 flex-shrink-0 mt-2">
                      <Crossfader value={crossfaderValueForUI} onChange={handleCrossfaderChange} className="w-32 h-4"/>
                      <RotationKnob value={weightShiftCurveForUI} onChange={handleWeightShiftCurveChange} size={48} label="Curve" />
                    </div>
                </div>

                <div className="relative w-full h-full flex justify-center items-center">
                     <FootControl side="R" onGroundingChange={handleGroundingChange} onRotate={handleRotationChange} rotation={rotation.R || 0} />
                </div>
            </div>
        </div>
    );
};

export default VisualizerDeck;