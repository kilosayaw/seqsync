import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useP5PoseAnimator } from '../../../hooks/useP5PoseAnimator';
import { useActionLogger } from '../../../hooks/useActionLogger';
import { useMedia } from '../../../contexts/MediaContext';
import { calculateValidKneePolygon } from '../../../utils/biomechanics';
import FootDisplay from '../pose_editor/FootDisplay';
import AngleOfAttack from '../pose_editor/AngleOfAttack';
import TactileJoystick from '../../common/TactileJoystick';
import VideoMediaPlayer from '../media/VideoMediaPlayer';

const VisualizerDeck = ({ livePoseData }) => {
    const log = useActionLogger('VisualizerDeck');
    const { activeBeatData, activeEditingJoint, currentEditingBar, activeBeatIndex, nudgeKneeValue } = useUIState();
    const { isPlaying, isRecording } = usePlayback();
    const { updateBeatDynamics } = useSequence();
    const { mediaStream, mediaUrl, videoPlayerRef } = useMedia();

    const isLive = isPlaying || isRecording;
    const hasMedia = !!mediaUrl || !!mediaStream;
    const targetPose = isLive && livePoseData ? livePoseData : activeBeatData;
    const { animatedPose } = useP5PoseAnimator(targetPose?.jointInfo, isLive);
    const { jointInfo } = animatedPose;
    const { grounding = {} } = targetPose || {};

    // Calculate valid knee paths for the Angle of Attack overlays
    const validLeftKneePath = calculateValidKneePolygon(jointInfo, 'L');
    const validRightKneePath = calculateValidKneePolygon(jointInfo, 'R');

    // Determine which overlays should be active based on the selected joint
    const showLK_Overlay = activeEditingJoint === 'LK';
    const showRK_Overlay = activeEditingJoint === 'RK';

    // Handlers for child components
    const handleKneeUpdate = useCallback((side, vector) => {
        const kneeAbbrev = `${side}K`;
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [kneeAbbrev]: { vector } }
        });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleKneeNudge = useCallback((side, dx, dy) => {
        const step = 0.05; // Sensitivity of the joystick
        nudgeKneeValue(side, dx * step, dy * step);
    }, [nudgeKneeValue]);
    
    const handleGroundingChange = useCallback((side, groundingKey) => {
        log('GroundingChange', { side, key: groundingKey });
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { grounding: { [side]: groundingKey } });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics, log]);

    const handleRotationChange = useCallback((side, newRotation) => {
        const jointAbbrev = side === 'L' ? 'LA' : 'RA';
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { jointInfo: { [jointAbbrev]: { rotation: newRotation } } });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const handleAnkleRotationChange = useCallback((side, newAnkleRotation) => {
        const jointAbbrev = side === 'L' ? 'LA' : 'RA';
        updateBeatDynamics(currentEditingBar, activeBeatIndex, { jointInfo: { [jointAbbrev]: { in_ex_rotation: newAnkleRotation } } });
    }, [currentEditingBar, activeBeatIndex, updateBeatDynamics]);
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 w-full h-full items-center justify-center">
                
                {/* --- Left Column: Foot Display and Tactile Joystick --- */}
                <div className="relative w-full h-full flex flex-col justify-center items-center gap-4">
                    <FootDisplay 
                        side="L" 
                        groundPoints={grounding.L} 
                        rotation={jointInfo?.LA?.rotation || 0} 
                        ankleRotation={jointInfo?.LA?.in_ex_rotation || 0} 
                        onRotate={handleRotationChange} 
                        onGroundingChange={handleGroundingChange} 
                        onAnkleRotationChange={handleAnkleRotationChange}
                    />
                    {/* The joystick is always present but only controls the knee when LK is active */}
                    <TactileJoystick onNudge={(dx, dy) => handleKneeNudge('L', dx, dy)} />
                    {showLK_Overlay && (
                        <AngleOfAttack 
                            side="L"
                            currentVector={jointInfo?.LK?.vector || { x: 0, y: -0.2, z: 0 }}
                            validPath={validLeftKneePath}
                            onUpdate={handleKneeUpdate}
                        />
                    )}
                </div>
                
                {/* --- Center Column: Video Player --- */}
                <div className="h-full w-full flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg shadow-2xl overflow-hidden max-w-[220px]">
                        {hasMedia ? (
                            <VideoMediaPlayer ref={videoPlayerRef} mediaUrl={mediaUrl} mediaStream={mediaStream} isPlaying={isPlaying} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                <p className="text-xs text-gray-500 text-center p-2">No Media Loaded</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Foot Display and Tactile Joystick --- */}
                <div className="relative w-full h-full flex flex-col justify-center items-center gap-4">
                     <FootDisplay 
                        side="R" 
                        groundPoints={grounding.R} 
                        rotation={jointInfo?.RA?.rotation || 0} 
                        ankleRotation={jointInfo?.RA?.in_ex_rotation || 0} 
                        onRotate={handleRotationChange} 
                        onGroundingChange={handleGroundingChange} 
                        onAnkleRotationChange={handleAnkleRotationChange}
                    />
                     <TactileJoystick onNudge={(dx, dy) => handleKneeNudge('R', dx, dy)} />
                     {showRK_Overlay && (
                        <AngleOfAttack 
                            side="R"
                            currentVector={jointInfo?.RK?.vector || { x: 0, y: -0.2, z: 0 }}
                            validPath={validRightKneePath}
                            onUpdate={handleKneeUpdate}
                        />
                     )}
                </div>
            </div>
        </div>
    );
};

VisualizerDeck.propTypes = { 
    livePoseData: PropTypes.object 
};

export default VisualizerDeck;