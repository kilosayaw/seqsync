import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useUIState } from "../../../contexts/UIStateContext";
import { useSequence } from "../../../contexts/SequenceContext";
import { toast } from "react-toastify";
import ModalBase from "../../common/ModalBase";
import SkeletalPoseVisualizer2D from "./SkeletalPoseVisualizer2D";
import Button from "../../common/Button";
// --- DEFINITIVE FIX: Change named import to default import ---
import JointInputPanel from "./JointInputPanel";
import { ALL_JOINTS_MAP, UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from "../../../utils/constants";
import { useActionLogger } from "../../../hooks/useActionLogger";

const PoseEditorModal = ({ isOpen, onClose, barIndex, beatIndex }) => {
  const log = useActionLogger('PoseEditorModal');
  const { songData, updateBeatDynamics, copyPose, pastePose, copiedPoseData } = useSequence();
  const { activeEditingJoint, setActiveEditingJoint } = useUIState();

  const beatData = useMemo(() => {
    return songData[barIndex]?.beats[beatIndex] || {};
  }, [songData, barIndex, beatIndex]);

  const handleJointDataUpdate = useCallback((jointAbbrev, newJointData) => {
    updateBeatDynamics(barIndex, beatIndex, {
        jointInfo: { [jointAbbrev]: { ...beatData.jointInfo?.[jointAbbrev], ...newJointData } }
    });
  }, [barIndex, beatIndex, updateBeatDynamics, beatData.jointInfo]);

  const handleCopy = () => {
    copyPose(barIndex, beatIndex);
    toast.success("Pose copied!");
  };

  const handlePaste = () => {
    pastePose(barIndex, beatIndex);
    toast.success("Pose pasted!");
  };

  const handleJointClick = (jointAbbrev) => {
    setActiveEditingJoint(jointAbbrev);
    log('JointClickedInModal', { joint: jointAbbrev });
  };

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button onClick={handleCopy}>Copy Pose</Button>
      <Button onClick={handlePaste} disabled={!copiedPoseData}>Paste Pose</Button>
      <Button onClick={onClose} variant="primary">Done</Button>
    </div>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Editing Pose for Bar ${barIndex + 1}, Beat ${beatIndex + 1}`}
      size="5xl"
      footerContent={footerContent}
    >
      <div className="grid grid-cols-12 gap-6 h-[60vh]">
        <aside className="col-span-2 space-y-1.5 overflow-y-auto scrollbar-thin">
            {UI_LEFT_JOINTS_ABBREVS_NEW.map(({abbrev, name}) => (
                <Button key={abbrev} onClick={() => setActiveEditingJoint(abbrev)} variant={activeEditingJoint === abbrev ? 'primary' : 'secondary'} className="w-full justify-start">{abbrev} - {name}</Button>
            ))}
        </aside>

        <main className="col-span-5 bg-black rounded-lg relative">
          <SkeletalPoseVisualizer2D
            jointInfoData={beatData.jointInfo}
            highlightJoint={activeEditingJoint}
            onJointClick={handleJointClick}
          />
        </main>
        
        <aside className="col-span-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5 overflow-y-auto scrollbar-thin max-h-[30vh]">
                    {UI_RIGHT_JOINTS_ABBREVS_NEW.map(({abbrev, name}) => (
                        <Button key={abbrev} onClick={() => setActiveEditingJoint(abbrev)} variant={activeEditingJoint === abbrev ? 'primary' : 'secondary'} className="w-full justify-start">{abbrev} - {name}</Button>
                    ))}
                </div>
                <div className="space-y-1.5">
                    {Object.entries(ALL_JOINTS_MAP).filter(([,d])=>d.group==='Center').map(([abbrev,d])=>({abbrev, name: d.name})).map(({abbrev, name}) => (
                        <Button key={abbrev} onClick={() => setActiveEditingJoint(abbrev)} variant={activeEditingJoint === abbrev ? 'primary' : 'secondary'} className="w-full justify-start">{abbrev} - {name}</Button>
                    ))}
                </div>
            </div>
            
            {activeEditingJoint && (
                <JointInputPanel 
                    jointAbbrev={activeEditingJoint} 
                    onUpdate={handleJointDataUpdate}
                    onClose={() => setActiveEditingJoint(null)}
                />
            )}
        </aside>
      </div>
    </ModalBase>
  );
};

PoseEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  barIndex: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
};

export default PoseEditorModal;