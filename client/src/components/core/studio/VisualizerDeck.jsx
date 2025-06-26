import React, { useCallback, useState, useMemo } from 'react';
import { toast } from 'react-toastify';

// CONTEXTS
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useMedia } from '../../../contexts/MediaContext';

// CHILD COMPONENTS
import FootDisplay from '../pose_editor/FootDisplay';
import CoreDynamicsVisualizer from '../pose_editor/CoreDynamicsVisualizer';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import TransitionEditor from '../pose_editor/TransitionEditor';
import HeadIndicator from '../../common/HeadIndicator';
import VideoMediaPlayer from '../media/VideoMediaPlayer';
import Crossfader from '../../common/Crossfader';
import Button from '../../common/Button';
import PoseInfoDisplay from '../main/PoseInfoDisplay'; 
import StabilityMeter from '../../common/StabilityMeter';

// HOOKS & UTILS
import { useP5PoseAnimator } from '../../../hooks/useP5PoseAnimator';
import { lerp, lerpVector } from '../../../utils/helpers';
import { UI_PADS_PER_BAR, TRANSITION_CURVES } from '../../../utils/constants';
import { analyzePoseDynamics } from '../../../utils/biomechanics';

const VisualizerDeck = () => {
    // --- State and Context Hooks ---
    const { activeBeatData, activeEditingJoint, currentEditingBar, activeBeatIndex, faderMode, setFaderMode } = useUIState();
    const { isPlaying, livePoseData } = usePlayback();
    const { songData, updateSongData, updateBeatDynamics } = useSequence();
    const { mediaSrcUrl, videoPlayerRef } = useMedia();
    
    // --- Local UI State ---
    const [transitionStartBeat, setTransitionStartBeat] = useState(0);
    const [transitionEndBeat, setTransitionEndBeat] = useState(1);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showCoreVisualizer, setShowCoreVisualizer] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(true);

    // --- Derived State and Biomechanical Analysis ---
    const targetPose = isPlaying && livePoseData ? livePoseData : activeBeatData;
    const { animatedPose, lerpAmount } = useP5PoseAnimator(targetPose);
    const poseDynamics = useMemo(() => analyzePoseDynamics(targetPose), [targetPose]);
    const { kineticPath, centerOfMass, stability, driver } = poseDynamics;
    const jointInfo = animatedPose?.jointInfo || {};
    const grounding = animatedPose?.grounding || {};

    const weightValue = grounding.L_weight ?? 50;
    const headXVector = jointInfo.H?.vector?.x || 0;
    const neckRotation = jointInfo.N?.rotation || 0;
    const crossfaderValue = faderMode === 'WEIGHT' ? 100 - weightValue : (headXVector + 1) * 50;
    const momentum = (jointInfo[driver]?.rotation || 0) * 2;
    
    const startBeatDataForTransition = songData[currentEditingBar]?.beats[transitionStartBeat];
    const transitionCurve = startBeatDataForTransition?.transition?.curve || 'LINEAR';

    // --- FULLY IMPLEMENTED HANDLERS ---
    const handleFaderChange = useCallback((newValue) => {
        if (faderMode === 'WEIGHT') {
            const newWeight = 100 - newValue;
            updateBeatDynamics(currentEditingBar, activeBeatIndex, { grounding: { L_weight: newWeight } });
        } else if (faderMode === 'HEAD') {
            const newHeadX = (newValue / 50) - 1;
            updateBeatDynamics(currentEditingBar, activeBeatIndex, { jointInfo: { H: { vector: { x: newHeadX } } } });
        }
    }, [faderMode, currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleGroundingChange = useCallback((side, newGroundingKey) => {
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            grounding: { [side]: newGroundingKey }
        });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleRotationChange = useCallback((side, newRotation) => {
        const jointAbbrev = side === 'L' ? 'LA' : 'RA';
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [jointAbbrev]: { rotation: newRotation } }
        });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);
    
    const handleAnkleRotationChange = useCallback((side, newAnkleRotation) => {
        const jointAbbrev = side === 'L' ? 'LA' : 'RA';
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [jointAbbrev]: { in_ex_rotation: newAnkleRotation } }
        });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleTransitionCurveChange = useCallback((newCurve) => {
        updateSongData(d => {
            const beatToUpdate = d[currentEditingBar].beats[transitionStartBeat];
            if (beatToUpdate?.transition) {
                beatToUpdate.transition.curve = newCurve;
            } else if (beatToUpdate) {
                beatToUpdate.transition = { curve: newCurve };
            }
            return d;
        }, 'Update Transition Curve');
    }, [currentEditingBar, transitionStartBeat, updateSongData]);

    const handleApplyTransition = useCallback(() => {
        // ... (this function remains unchanged)
        if (transitionStartBeat >= transitionEndBeat) {
            toast.error("Start beat must be before end beat.");
            return;
        }
        const startBeat = songData[currentEditingBar]?.beats[transitionStartBeat];
        const endBeat = songData[currentEditingBar]?.beats[transitionEndBeat];
        if (!startBeat?.jointInfo || !endBeat?.jointInfo) {
            toast.error("Transition beats must have pose data.");
            return;
        }
        const curveKey = startBeat.transition?.curve || 'LINEAR';
        const curveFunction = TRANSITION_CURVES[curveKey]?.function || TRANSITION_CURVES.LINEAR.function;

        updateSongData(d => {
            const beats = d[currentEditingBar].beats;
            const totalSteps = transitionEndBeat - transitionStartBeat;
            for (let i = 1; i < totalSteps; i++) {
                const stepIndex = transitionStartBeat + i;
                const amt = curveFunction(i / totalSteps);
                const iBeat = beats[stepIndex];
                if (!iBeat.grounding) iBeat.grounding = {};
                iBeat.grounding.L_weight = lerp(startBeat.grounding?.L_weight ?? 50, endBeat.grounding?.L_weight ?? 50, amt);
                if (!iBeat.jointInfo) iBeat.jointInfo = {};
                const allKeys = new Set([...Object.keys(startBeat.jointInfo || {}), ...Object.keys(endBeat.jointInfo || {})]);
                allKeys.forEach(key => {
                    const startJoint = startBeat.jointInfo?.[key];
                    const endJoint = endBeat.jointInfo?.[key];
                    if (startJoint && endJoint) {
                        if (!iBeat.jointInfo[key]) iBeat.jointInfo[key] = {};
                        iBeat.jointInfo[key].vector = lerpVector(startJoint.vector, endJoint.vector, amt);
                        iBeat.jointInfo[key].rotation = lerp(startJoint.rotation || 0, endJoint.rotation || 0, amt);
                    }
                });
            }
            return d;
        }, "Apply Transition");
        toast.success(`Transition applied using ${TRANSITION_CURVES[curveKey].label} curve.`);
    }, [transitionStartBeat, transitionEndBeat, songData, currentEditingBar, updateSongData]);
    
    const handlePlaceholder = () => {};

    // --- Rendering ---
    return (
        <section aria-label="Main Visualizers and Controls" className="w-full flex-grow relative flex flex-col items-center justify-between overflow-hidden p-1">
            <div className="grid grid-cols-8 gap-1.5 w-full flex-grow">
                <div className="col-span-3 flex items-center justify-center">
                    <FootDisplay 
                        side="L" 
                        groundPoints={grounding.L} 
                        rotation={jointInfo.LA?.rotation || 0} 
                        ankleRotation={jointInfo.LA?.in_ex_rotation || 0} 
                        onRotate={handleRotationChange} 
                        onGroundingChange={handleGroundingChange} 
                        onAnkleRotationChange={handleAnkleRotationChange} 
                    />
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center gap-1.5 h-full">
                    <HeadIndicator xOffset={headXVector} neckRotation={neckRotation} />
                    
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg shadow-2xl flex items-center justify-center">
                        <VideoMediaPlayer ref={videoPlayerRef} mediaSrc={mediaSrcUrl} isPlaying={isPlaying} />
                        
                        {showSkeleton && (
                            <div className="absolute inset-0 pointer-events-none">
                                <P5SkeletalVisualizer 
                                    fullPoseState={jointInfo} 
                                    targetPose={targetPose.jointInfo} 
                                    lerpAmount={lerpAmount} 
                                    highlightJoint={activeEditingJoint} 
                                    kineticFlow={{ path: kineticPath, momentum }} 
                                    centerOfMass={centerOfMass} 
                                    grounding={grounding}
                                    className="w-full h-full" 
                                />
                            </div>
                        )}
                        {showCoreVisualizer && (
                             <div className="absolute inset-0 pointer-events-none bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <CoreDynamicsVisualizer fullPoseState={jointInfo} beatGrounding={grounding} onCoreInputChange={handlePlaceholder} className="w-[90%] h-[90%]" />
                            </div>
                        )}
                    </div>

                    <StabilityMeter score={stability} />
                    {showInfoPanel && <PoseInfoDisplay poseDynamics={poseDynamics} />}
                    
                    <div className="flex gap-2 mt-1">
                        <Button size="xs" onClick={() => setShowSkeleton(s => !s)} variant={showSkeleton ? 'primary' : 'secondary'}>Skeleton</Button>
                        <Button size="xs" onClick={() => setShowCoreVisualizer(c => !c)} variant={showCoreVisualizer ? 'primary' : 'secondary'}>Core Viz</Button>
                        <Button size="xs" onClick={() => setShowInfoPanel(i => !i)} variant={showInfoPanel ? 'primary' : 'secondary'}>Info</Button>
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                        <Button onClick={() => setFaderMode('WEIGHT')} size="xs" variant={faderMode === 'WEIGHT' ? 'primary' : 'secondary'}>WEIGHT</Button>
                        <Crossfader value={crossfaderValue} onChange={handleFaderChange} className="w-full max-w-[200px] h-4"/>
                        <Button onClick={() => setFaderMode('HEAD')} size="xs" variant={faderMode === 'HEAD' ? 'primary' : 'secondary'}>HEAD</Button>
                    </div>
                </div>
                <div className="col-span-3 flex items-center justify-center">
                    <FootDisplay 
                        side="R" 
                        groundPoints={grounding.R} 
                        rotation={jointInfo.RA?.rotation || 0} 
                        ankleRotation={jointInfo.RA?.in_ex_rotation || 0} 
                        onRotate={handleRotationChange} 
                        onGroundingChange={handleGroundingChange} 
                        onAnkleRotationChange={handleAnkleRotationChange} 
                    />
                </div>
            </div>
            <div className="mt-auto w-full py-2">
              <TransitionEditor 
                startBeat={transitionStartBeat} 
                endBeat={transitionEndBeat} 
                curve={transitionCurve}
                maxBeat={UI_PADS_PER_BAR} 
                onStartBeatChange={setTransitionStartBeat} 
                onEndBeatChange={setTransitionEndBeat}
                onCurveChange={handleTransitionCurveChange} 
                onApplyTransition={handleApplyTransition} 
              />
            </div>
        </section>
    );
};

export default VisualizerDeck;