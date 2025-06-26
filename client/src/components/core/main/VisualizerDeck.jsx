import React, { useCallback, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useMedia } from '../../../contexts/MediaContext';
import FootDisplay from '../pose_editor/FootDisplay';
import CoreDynamicsVisualizer from '../pose_editor/CoreDynamicsVisualizer';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import TransitionEditor from '../pose_editor/TransitionEditor';
import HeadIndicator from '../../common/HeadIndicator';
import VideoMediaPlayer from '../media/VideoMediaPlayer';
import Crossfader from '../../common/Crossfader';
import Button from '../../common/Button';
import PoseInfoDisplay from './PoseInfoDisplay';
import { useP5PoseAnimator } from '../../../hooks/useP5PoseAnimator';
import { lerp, lerpVector } from '../../../utils/helpers';
import { UI_PADS_PER_BAR, TRANSITION_CURVES } from '../../../utils/constants';
import { analyzePoseDynamics } from '../../../utils/biomechanics';

const VisualizerDeck = () => {
    // Contexts and State
    const { activeBeatData, activeEditingJoint, currentEditingBar, activeBeatIndex, faderMode, setFaderMode } = useUIState();
    const { isPlaying, livePoseData } = usePlayback();
    const { songData, updateSongData } = useSequence();
    const { mediaSrcUrl, videoPlayerRef } = useMedia();
    const [transitionStartBeat, setTransitionStartBeat] = useState(0);
    const [transitionEndBeat, setTransitionEndBeat] = useState(1);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showCoreVisualizer, setShowCoreVisualizer] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(true);

    // Derived State
    const targetPose = isPlaying && livePoseData ? livePoseData : activeBeatData;
    const { animatedPose, lerpAmount } = useP5PoseAnimator(targetPose);
    const poseDynamics = useMemo(() => analyzePoseDynamics(targetPose), [targetPose]);
    const { kineticPath, centerOfMass } = poseDynamics;
    const jointInfo = animatedPose?.jointInfo || {};
    const grounding = animatedPose?.grounding || {};
    const startBeatDataForTransition = songData[currentEditingBar]?.beats[transitionStartBeat];
    const transitionCurve = startBeatDataForTransition?.transition?.curve || 'LINEAR';
    const weightValue = grounding.L_weight ?? 50;
    const headXVector = jointInfo.H?.vector?.x || 0;
    const neckRotation = jointInfo.N?.rotation || 0;
    const crossfaderValue = faderMode === 'WEIGHT' ? 100 - weightValue : (headXVector + 1) * 50;
    const momentum = (jointInfo[poseDynamics.driver]?.rotation || 0) * 2;

    // --- FULLY IMPLEMENTED HANDLER for Core Dynamics ---
    const handleCoreInputChange = useCallback((jointAbbrev, property, value) => {
        updateSongData(d => {
            const beat = d[currentEditingBar].beats[activeBeatIndex];
            if (!beat.jointInfo) {
                beat.jointInfo = {};
            }
            if (!beat.jointInfo[jointAbbrev]) {
                beat.jointInfo[jointAbbrev] = {};
            }
            beat.jointInfo[jointAbbrev][property] = value;
            return d;
        }, `Update Core: ${jointAbbrev}`);
        toast.info(`Core updated: ${jointAbbrev} ${property}`);
    }, [currentEditingBar, activeBeatIndex, updateSongData]);
    
    // Other handlers...
    const handleTransitionCurveChange = useCallback((newCurve) => { /* ... as before ... */ }, [/* ... */]);
    const handleApplyTransition = useCallback(() => { /* ... as before ... */ }, [/* ... */]);
    const handlePlaceholder = () => {};

    return (
        <section aria-label="Main Visualizers and Controls" className="w-full flex-grow relative flex flex-col items-center justify-between overflow-hidden p-1">
            <div className="grid grid-cols-8 gap-1.5 w-full flex-grow">
                {/* Left Deck */}
                <div className="col-span-3 flex items-center justify-center">
                    <FootDisplay side="L" groundPoints={grounding.L} rotation={jointInfo.LA?.rotation || 0} ankleRotation={jointInfo.LA?.in_ex_rotation || 0} onRotate={handlePlaceholder} onGroundingChange={handlePlaceholder} onAnkleRotationChange={handlePlaceholder} />
                </div>

                {/* Center Column */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-1 h-full">
                    <HeadIndicator xOffset={headXVector} neckRotation={neckRotation} />
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg shadow-2xl flex items-center justify-center">
                        <VideoMediaPlayer ref={videoPlayerRef} mediaSrc={mediaSrcUrl} isPlaying={isPlaying} />
                        {showSkeleton && (
                            <div className="absolute inset-0 pointer-events-none">
                                <P5SkeletalVisualizer fullPoseState={jointInfo} targetPose={targetPose.jointInfo} lerpAmount={lerpAmount} highlightJoint={activeEditingJoint} kineticFlow={{ path: kineticPath, momentum }} centerOfMass={centerOfMass} className="w-full h-full" />
                            </div>
                        )}
                        {showCoreVisualizer && (
                             <div className="absolute inset-0 pointer-events-none bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                {/* The handler is now passed down correctly */}
                                <CoreDynamicsVisualizer fullPoseState={jointInfo} beatGrounding={grounding} onCoreInputChange={handleCoreInputChange} className="w-[90%] h-[90%]" />
                            </div>
                        )}
                    </div>
                    {showInfoPanel && <PoseInfoDisplay poseDynamics={poseDynamics} />}
                    <div className="flex gap-2 mt-1">
                        <Button size="xs" onClick={() => setShowSkeleton(s => !s)} variant={showSkeleton ? 'primary' : 'secondary'}>Skeleton</Button>
                        <Button size="xs" onClick={() => setShowCoreVisualizer(c => !c)} variant={showCoreVisualizer ? 'primary' : 'secondary'}>Core Viz</Button>
                        <Button size="xs" onClick={() => setShowInfoPanel(i => !i)} variant={showInfoPanel ? 'primary' : 'secondary'}>Info</Button>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                        <Button onClick={() => setFaderMode('WEIGHT')} size="xs" variant={faderMode === 'WEIGHT' ? 'primary' : 'secondary'}>WEIGHT</Button>
                        <Crossfader value={crossfaderValue} onChange={handlePlaceholder} className="w-full max-w-[200px] h-4"/>
                        <Button onClick={() => setFaderMode('HEAD')} size="xs" variant={faderMode === 'HEAD' ? 'primary' : 'secondary'}>HEAD</Button>
                    </div>
                </div>

                {/* Right Deck */}
                <div className="col-span-3 flex items-center justify-center">
                    <FootDisplay side="R" groundPoints={grounding.R} rotation={jointInfo.RA?.rotation || 0} ankleRotation={jointInfo.RA?.in_ex_rotation || 0} onRotate={handlePlaceholder} onGroundingChange={handlePlaceholder} onAnkleRotationChange={handlePlaceholder} />
                </div>
            </div>
            <div className="mt-auto w-full py-2">
              <TransitionEditor 
                startBeat={transitionStartBeat} endBeat={transitionEndBeat} curve={transitionCurve}
                maxBeat={UI_PADS_PER_BAR} 
                onStartBeatChange={setTransitionStartBeat} onEndBeatChange={setTransitionEndBeat}
                onCurveChange={handleTransitionCurveChange} onApplyTransition={handleApplyTransition} 
              />
            </div>
        </section>
    );
};

export default VisualizerDeck;