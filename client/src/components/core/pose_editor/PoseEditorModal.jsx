import React, { useState, useEffect, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'react-toastify';

// --- CHILD COMPONENTS (Corrected Paths) ---
import ModalBase from '../../common/ModalBase';
import SkeletalPoseVisualizer2D from './SkeletalPoseVisualizer2D';
import DraggableMarker from '../../common/DraggableMarker';
import Button from '../../common/Button';
import SideJointSelector from './SideJointSelector';
import { JointInputPanel } from './JointInputPanel';

// --- CONTEXT & HOOKS (Corrected Paths) ---
import { useSequence } from '../../../contexts/SequenceContext';
import { useActionLogger } from '../../../hooks/useActionLogger'; // <-- Import our new logger

// --- CONSTANTS (Corrected Paths) ---
import { DEFAULT_POSITIONS_2D } from '../../../utils/constants';

const PoseEditorModal = ({ isOpen, onClose, barIndex, beatIndex }) => {
    const log = useActionLogger('PoseEditorModal'); // <-- Initialize the logger
    const { songData, updateSongData } = useSequence();
    const [localPose, setLocalPose] = useState(null);
    const [markers, setMarkers] = useState({});
    const [selectedJoint, setSelectedJoint] = useState(null);

    useEffect(() => {
        // --- NAN BUG FIX & GUARD CLAUSE ---
        const isValid = isOpen && barIndex !== undefined && beatIndex !== undefined && !isNaN(beatIndex);
        
        if (!isValid) {
            if (isOpen) { // Only log if an attempt was made to open it with bad data
                log('OpenAttemptFailed', { reason: 'Invalid or NaN index received', barIndex, beatIndex });
            }
            return; // Do not proceed if the indices are invalid
        }

        const initialJointInfo = songData[barIndex]?.beats[beatIndex]?.jointInfo || {};
        setLocalPose(initialJointInfo);
        
        const initialMarkers = {};
        Object.keys(DEFAULT_POSITIONS_2D).forEach(key => {
            const jointData = initialJointInfo[key];
            const defaultPos = DEFAULT_POSITIONS_2D[key];
            initialMarkers[key] = {
                x: jointData?.vector ? (jointData.vector.x + 1) * 50 : defaultPos.x * 100,
                y: jointData?.vector ? (-jointData.vector.y + 1) * 50 : defaultPos.y * 100,
            };
        });
        setMarkers(initialMarkers);
        setSelectedJoint(null);

    }, [isOpen, barIndex, beatIndex, songData, log]);

    // This handler is called every time a joint marker is dragged.
    const handleDragEnd = useCallback((event) => {
        const { active, delta } = event;
        const jointId = active.id;

        // The visualizer container div is the reference for pixel-to-percentage conversion
        const container = event.target.parentElement; 
        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        // Update the marker's screen position (in percentages)
        const updatedMarkers = { ...markers };
        updatedMarkers[jointId] = {
            x: markers[jointId].x + (delta.x / containerRect.width) * 100,
            y: markers[jointId].y + (delta.y / containerRect.height) * 100,
        };
        setMarkers(updatedMarkers);

        // Immediately update the local pose data state by converting the
        // new screen percentage back into the poSĒQr™ [-1, 1] vector format.
        setLocalPose(prevPose => {
            const newPose = { ...prevPose };
            if (!newPose[jointId]) newPose[jointId] = {};
            newPose[jointId].vector = {
                x: (updatedMarkers[jointId].x / 50) - 1,
                y: -((updatedMarkers[jointId].y / 50) - 1),
                z: newPose[jointId]?.vector?.z || 0, // Preserve existing Z-depth
            };
            return newPose;
        });

    }, [markers]);

     const handleJointDataUpdate = useCallback((jointAbbrev, newJointData) => {
        setLocalPose(prevPose => ({
            ...prevPose,
            [jointAbbrev]: newJointData
        }));
    }, []);


    const handleSaveChanges = () => {
        updateSongData(d => {
            d[barIndex].beats[beatIndex].jointInfo = localPose;
            return d;
        }, 'Update Pose');
        toast.success(`Pose updated for B${barIndex + 1}:S${beatIndex + 1}`);
        onClose();
    };

    const modalFooter = (
        <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </div>
    );

    const title = `Editing Pose: Bar ${barIndex !== undefined ? barIndex + 1 : 'N/A'}, Beat ${beatIndex !== undefined && !isNaN(beatIndex) ? beatIndex + 1 : 'N/A'}`;

    return (
        <ModalBase 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            size="6xl"
            footerContent={modalFooter}
        >
            <DndContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 h-[70vh]">
                    
                    {/* Left Controls Area */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg text-text-primary">Left Side</h3>
                        <SideJointSelector side="L" onJointSelect={setSelectedJoint} activeEditingJoint={selectedJoint} />
                    </div>

                    {/* Visualizer Area */}
                    <div className="h-full bg-black rounded-lg relative overflow-hidden">
                        <SkeletalPoseVisualizer2D 
                            jointInfoData={localPose || {}} 
                            highlightJoint={selectedJoint} 
                            onJointClick={setSelectedJoint} 
                        />
                        {Object.entries(markers).map(([key, pos]) => (
                            <DraggableMarker 
                                key={key} id={key} label={key} position={pos}
                                z_depth={localPose?.[key]?.vector?.z}
                            />
                        ))}
                    </div>

                    {/* Right Controls Area */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg text-text-primary">Right Side</h3>
                         <SideJointSelector side="R" onJointSelect={setSelectedJoint} activeEditingJoint={selectedJoint} />
                    </div>
                    
                    {/* --- JOINT INPUT PANEL RENDERED CONDITIONALLY --- */}
                    {selectedJoint && (
                        <div className="md:col-start-1 md:col-end-4 mt-4">
                             <JointInputPanel
                                jointAbbrev={selectedJoint}
                                jointData={localPose?.[selectedJoint]}
                                onUpdate={handleJointDataUpdate}
                             />
                        </div>
                    )}
                </div>
            </DndContext>
        </ModalBase>
    );
};

export default PoseEditorModal;