// src/components/core/pose_editor/PoseEditorModalComponent.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import ModalBase from '../../common/ModalBase';
import { JointInputPanel } from './JointInputPanel';
import FootDisplay from './FootDisplay';
import FootJoystickOverlay from './FootJoystickOverlay'; // Added
import CoreDynamicsVisualizer from './CoreDynamicsVisualizer';
import SkeletalPoseVisualizer2D from './SkeletalPoseVisualizer2D';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faEye, faEyeSlash, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import {
  ALL_JOINTS_MAP,
  UI_LEFT_JOINTS_ABBREVS_NEW,
  UI_RIGHT_JOINTS_ABBREVS_NEW
} from '../../../utils/sounds';
import {
  DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
  createDefaultBeatObject, 
  DEFAULT_NUM_BEATS_PER_BAR_CONST, // Renamed for clarity if used for array length
  DEFAULT_GENERAL_ORIENTATION,
  DEFAULT_INTENT,
  DEFAULT_JOINT_ENERGY,
  // Assuming MODE_POS is defined in constants if needed here, or passed as prop
} from '../../../utils/constants';

const MODAL_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40"; // Standardized

const MiniBeatPad = ({ beatStepData, stepIndex, isActive, onClick }) => {
  const { sounds = [], jointInfo = {}, grounding = {} } = beatStepData || createDefaultBeatObject(stepIndex);
  const hasSoundData = sounds.length > 0;
  const hasMeaningfulJointData = Object.values(jointInfo).some(details => details && typeof details === 'object' && ((details.rotation !== undefined && parseFloat(details.rotation) !== 0) || (details.orientation && details.orientation !== DEFAULT_GENERAL_ORIENTATION) || (details.vector && (details.vector.x !== 0 || details.vector.y !== 0 || details.vector.z !== 0)) || (details.intent && details.intent !== DEFAULT_INTENT) || (details.energy !== undefined && parseFloat(details.energy) !== DEFAULT_JOINT_ENERGY) || (details.orientation_sagittal && details.orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) || (details.orientation_frontal && details.orientation_frontal !== DEFAULT_ANKLE_FRONTAL) || (details.orientation_transverse && details.orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE)));
  const hasGroundingData = (grounding?.L && grounding.L.length > 0) || (grounding?.R && grounding.R.length > 0) || (grounding?.L_weight !== undefined && grounding.L_weight !== 50);

  return (
    <button
      type="button"
      onClick={() => onClick(stepIndex)}
      className={`w-full aspect-square rounded text-xxs flex flex-col items-center justify-center relative p-0.5 transition-all
                  ${isActive ? 'bg-yellow-500 text-black ring-2 ring-yellow-300 scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'}`}
      aria-pressed={isActive}
      aria-label={`Select beat ${stepIndex + 1}`}
      title={`Edit Step ${stepIndex + 1}`}
    >
      <span className="font-mono text-[0.6rem]">{stepIndex + 1}</span>
      <div className="absolute bottom-0.5 right-0.5 flex flex-col space-y-px">
        {hasSoundData && <div className="w-1 h-1 bg-blue-400 rounded-full" title="Sound Data"></div>}
        {hasMeaningfulJointData && <div className="w-1 h-1 bg-yellow-400 rounded-full" title="Pose Data"></div>}
        {hasGroundingData && <div className="w-1 h-1 bg-green-400 rounded-full" title="Grounding Data"></div>}
      </div>
    </button>
  );
};
MiniBeatPad.propTypes = { beatStepData: PropTypes.object, stepIndex: PropTypes.number.isRequired, isActive: PropTypes.bool.isRequired, onClick: PropTypes.func.isRequired };


const PoseEditorModalComponent = ({
  isOpen, onClose, initialBeatDataForModal, initialActiveJointAbbrev, 
  currentBarSongData, onModalBeatSelect,  
  onSaveGrounding, onSaveJointDetails, onClearJointDetails, onClearGrounding, onSaveSyllable, onSaveHeadOver,
  logToConsoleFromParent, currentShowSkeletonLinesState, onToggleSkeletonLinesInModal, onJointSelectInModal,
}) => {
  const [internalModalBeatData, setInternalModalBeatData] = useState(createDefaultBeatObject(0)); // Initialize with a default structure
  const [modalInternalActiveJoint, setModalInternalActiveJoint] = useState(null);
  const [liveJointPanelEdits, setLiveJointPanelEdits] = useState({});
  
  // Ankle specific states - managed here as they are specific to when an ankle joint is active in the panel
  const [modalAnkleSagittal, setModalAnkleSagittal] = useState(DEFAULT_ANKLE_SAGITTAL);
  const [modalAnkleFrontal, setModalAnkleFrontal] = useState(DEFAULT_ANKLE_FRONTAL);
  const [modalAnkleTransverse, setModalAnkleTransverse] = useState(DEFAULT_ANKLE_TRANSVERSE);
  
  const isAnkleCurrentlyActiveInModal = useMemo(() => 
    modalInternalActiveJoint === 'L_ANK' || modalInternalActiveJoint === 'R_ANK', 
  [modalInternalActiveJoint]);

  useEffect(() => {
    if (isOpen && initialBeatDataForModal && typeof initialBeatDataForModal.id === 'number') {
      const grounding = initialBeatDataForModal.grounding || { L: null, R: null, L_weight: 50 };
      const jointInfo = initialBeatDataForModal.jointInfo || {};
      setInternalModalBeatData({ 
        ...initialBeatDataForModal, 
        grounding: { ...grounding, L_weight: grounding.L_weight !== undefined ? grounding.L_weight : 50 }, 
        jointInfo, 
      });
      
      const newActiveJoint = initialActiveJointAbbrev || null;
      setModalInternalActiveJoint(newActiveJoint);
      
      const currentJointDataForPanel = newActiveJoint ? (jointInfo[newActiveJoint] || {}) : {};
      setLiveJointPanelEdits(currentJointDataForPanel);

      if (newActiveJoint === 'L_ANK' || newActiveJoint === 'R_ANK') {
        setModalAnkleSagittal(currentJointDataForPanel.orientation_sagittal || DEFAULT_ANKLE_SAGITTAL);
        setModalAnkleFrontal(currentJointDataForPanel.orientation_frontal || DEFAULT_ANKLE_FRONTAL);
        setModalAnkleTransverse(currentJointDataForPanel.orientation_transverse || DEFAULT_ANKLE_TRANSVERSE);
      } else { 
        setModalAnkleSagittal(DEFAULT_ANKLE_SAGITTAL); 
        setModalAnkleFrontal(DEFAULT_ANKLE_FRONTAL); 
        setModalAnkleTransverse(DEFAULT_ANKLE_TRANSVERSE); 
      }
    } else if (!isOpen) { // Reset when modal closes
        setInternalModalBeatData(createDefaultBeatObject(0));
        setModalInternalActiveJoint(null);
        setLiveJointPanelEdits({});
        setModalAnkleSagittal(DEFAULT_ANKLE_SAGITTAL); 
        setModalAnkleFrontal(DEFAULT_ANKLE_FRONTAL); 
        setModalAnkleTransverse(DEFAULT_ANKLE_TRANSVERSE); 
    }
  }, [isOpen, initialBeatDataForModal, initialActiveJointAbbrev]);

  const handleJointPanelLiveChange = useCallback((updatedJointDetailsFromPanel) => {
    setLiveJointPanelEdits(updatedJointDetailsFromPanel);
    // Live update the main visualizer if an active joint is being edited
    if(modalInternalActiveJoint) {
        setInternalModalBeatData(prev => ({
            ...prev,
            jointInfo: {
                ...(prev.jointInfo || {}),
                [modalInternalActiveJoint]: {
                    ...(prev.jointInfo?.[modalInternalActiveJoint] || {}),
                    ...updatedJointDetailsFromPanel
                }
            }
        }));
    }
  }, [modalInternalActiveJoint]);

  const handleSaveFromJointPanel = useCallback((jointAbbrev, baseJointDetailsFromPanel) => {
    let finalJointDetailsToSave = { ...baseJointDetailsFromPanel };
    if (jointAbbrev === 'L_ANK' || jointAbbrev === 'R_ANK') {
      finalJointDetailsToSave.orientation_sagittal = modalAnkleSagittal;
      finalJointDetailsToSave.orientation_frontal = modalAnkleFrontal;
      finalJointDetailsToSave.orientation_transverse = modalAnkleTransverse;
    }
    onSaveJointDetails(initialBeatDataForModal.id, jointAbbrev, finalJointDetailsToSave); // Pass beatId
    setInternalModalBeatData(prev => ({
      ...prev,
      jointInfo: {
        ...(prev.jointInfo || {}),
        [jointAbbrev]: finalJointDetailsToSave
      }
    }));
    setLiveJointPanelEdits(finalJointDetailsToSave); 
    toast.success(`Joint ${ALL_JOINTS_MAP[jointAbbrev]?.name || jointAbbrev} saved for Step ${initialBeatDataForModal.id + 1}.`);
  }, [onSaveJointDetails, modalAnkleSagittal, modalAnkleFrontal, modalAnkleTransverse, initialBeatDataForModal.id]);

  const handleClearFromJointPanel = useCallback((jointAbbrev) => {
    onClearJointDetails(initialBeatDataForModal.id, jointAbbrev); // Pass beatId
    setInternalModalBeatData(prev => {
      const newJointInfo = { ...(prev.jointInfo || {}) };
      delete newJointInfo[jointAbbrev];
      return { ...prev, jointInfo: newJointInfo };
    });
    setLiveJointPanelEdits({}); 
    if (jointAbbrev === 'L_ANK' || jointAbbrev === 'R_ANK') {
      setModalAnkleSagittal(DEFAULT_ANKLE_SAGITTAL);
      setModalAnkleFrontal(DEFAULT_ANKLE_FRONTAL);
      setModalAnkleTransverse(DEFAULT_ANKLE_TRANSVERSE);
    }
    toast.info(`Joint ${ALL_JOINTS_MAP[jointAbbrev]?.name || jointAbbrev} cleared for Step ${initialBeatDataForModal.id + 1}.`);
  }, [onClearJointDetails, initialBeatDataForModal.id]);
  
  const handleWeightChangeInModal = useCallback((e) => {
    const newLeftWeight = parseInt(e.target.value, 10);
    if (!isNaN(newLeftWeight) && newLeftWeight >= 0 && newLeftWeight <= 100) {
      setInternalModalBeatData(prev => ({
        ...prev,
        grounding: { ...(prev.grounding || {L: null, R: null}), L_weight: newLeftWeight }
      }));
    }
  }, []);
  
  // New handler for FootJoystickOverlay
  const handleGroundingChangeFromJoystick = useCallback((side, newGroundPoints) => {
    setInternalModalBeatData(prev => {
        const currentGrounding = prev.grounding || {L: null, R: null, L_weight: 50};
        const updatedGrounding = {
            ...currentGrounding,
            [side]: newGroundPoints // newGroundPoints is an array of strings or null
        };
        return {...prev, grounding: updatedGrounding};
    });
    logToConsoleFromParent?.(`[ModalJoys] Grounding for ${side} set to: ${newGroundPoints?.join(', ') || 'None'}`);
  }, [logToConsoleFromParent]);


  const handleSaveGroundingAndWeightFromModal = useCallback(() => {
    const groundingToSave = {
      L: internalModalBeatData.grounding?.L || null,
      R: internalModalBeatData.grounding?.R || null,
      L_weight: internalModalBeatData.grounding?.L_weight !== undefined ? internalModalBeatData.grounding.L_weight : 50,
    };
    onSaveGrounding(initialBeatDataForModal.id, groundingToSave); // Pass beatId
    toast.success("Grounding & Weight saved.");
  }, [onSaveGrounding, internalModalBeatData.grounding, initialBeatDataForModal.id]);

  const handleClearGroundingAndWeightFromModal = useCallback(() => {
    setInternalModalBeatData(prev => ({ ...prev, grounding: { L: null, R: null, L_weight: 50 } }));
    onClearGrounding(initialBeatDataForModal.id); // Pass beatId
    toast.info("Grounding & Weight cleared.");
  }, [onClearGrounding, initialBeatDataForModal.id]);
  
  const handleSyllableChangeInModal = useCallback((e) => {
    setInternalModalBeatData(prev => ({...prev, syllable: e.target.value }));
  }, []);

  const handleSaveSyllableClickInModal = useCallback(() => {
    onSaveSyllable(initialBeatDataForModal.id, internalModalBeatData.syllable || ''); // Pass beatId
    toast.success("Syllable saved.");
  }, [onSaveSyllable, internalModalBeatData.syllable, initialBeatDataForModal.id]);

  const handleHeadOverChangeInModal = useCallback((e) => {
    setInternalModalBeatData(prev => ({...prev, headOver: e.target.value }));
  }, []);
  
  const handleSaveHeadOverClickInModal = useCallback(() => {
    onSaveHeadOver(initialBeatDataForModal.id, internalModalBeatData.headOver === 'None' ? null : internalModalBeatData.headOver); // Pass beatId
    toast.success("Head Alignment saved.");
  }, [onSaveHeadOver, internalModalBeatData.headOver, initialBeatDataForModal.id]);

  const handleCoreDynamicsInputChangeInModal = useCallback((jointAbbrev, property, value) => {
    const currentBeatId = initialBeatDataForModal.id;
    const currentJointData = internalModalBeatData.jointInfo?.[jointAbbrev] || {};
    const updatedDetails = { ...currentJointData, [property]: value };
    
    onSaveJointDetails(currentBeatId, jointAbbrev, updatedDetails); 
    
    setInternalModalBeatData(prev => ({
      ...prev,
      jointInfo: { ...(prev.jointInfo || {}), [jointAbbrev]: updatedDetails }
    }));
    if (modalInternalActiveJoint === jointAbbrev) {
      setLiveJointPanelEdits(prevLive => ({...prevLive, ...updatedDetails}));
    }
    toast.info(`Core joint ${jointAbbrev} ${property} updated.`);
  }, [initialBeatDataForModal.id, internalModalBeatData.jointInfo, onSaveJointDetails, modalInternalActiveJoint]);

  const handleJointClickInModalVisualizer = useCallback((jointAbbrev) => {
    setModalInternalActiveJoint(jointAbbrev);
    const newJointData = internalModalBeatData.jointInfo?.[jointAbbrev] || {};
    setLiveJointPanelEdits(newJointData); 
    if (jointAbbrev === 'L_ANK' || jointAbbrev === 'R_ANK') {
      setModalAnkleSagittal(newJointData.orientation_sagittal || DEFAULT_ANKLE_SAGITTAL);
      setModalAnkleFrontal(newJointData.orientation_frontal || DEFAULT_ANKLE_FRONTAL);
      setModalAnkleTransverse(newJointData.orientation_transverse || DEFAULT_ANKLE_TRANSVERSE);
    }
    if (onJointSelectInModal) onJointSelectInModal(jointAbbrev);
  }, [internalModalBeatData.jointInfo, onJointSelectInModal]);
  
  // Critical: Implement modal beat navigation correctly
  const handleModalBeatPadClick = useCallback((newBeatIndex) => {
    if (onModalBeatSelect) {
        onModalBeatSelect(newBeatIndex); // This tells the parent to change the activeBeatIndex
        // The parent will then re-render this modal with new initialBeatDataForModal prop
    }
  }, [onModalBeatSelect]);


  const modalTitle = useMemo(() => {
    const barNumber = initialBeatDataForModal?.barNumber || 'N/A';
    const beatDisplay = (typeof initialBeatDataForModal?.id === 'number') ? initialBeatDataForModal.id + 1 : 'N/A';
    if (modalInternalActiveJoint) {
      return `Edit: ${ALL_JOINTS_MAP[modalInternalActiveJoint]?.name || modalInternalActiveJoint} (Bar ${barNumber}, Step ${beatDisplay})`;
    }
    return `Beat Details (Bar ${barNumber}, Step ${beatDisplay})`;
  }, [initialBeatDataForModal, modalInternalActiveJoint]);
  
  const headOverOptionsForModal = useMemo(() => {
    const jointOptions = Object.keys(ALL_JOINTS_MAP).sort().map(key => ({
      value: key, label: `${key} - ${ALL_JOINTS_MAP[key].name}`
    }));
    return [ {value:'None', label:'None/Not Specified'}, {value:'CENTER', label:'Center of Mass/Base'}, ...jointOptions ];
  },[]);

  const initialDataForJointInputPanel = useMemo(() => {
    let data = { ...(internalModalBeatData.jointInfo?.[modalInternalActiveJoint] || {}), ...liveJointPanelEdits };
    if (modalInternalActiveJoint === 'L_ANK' || modalInternalActiveJoint === 'R_ANK') {
      data.orientation_sagittal = modalAnkleSagittal;
      data.orientation_frontal = modalAnkleFrontal;
      data.orientation_transverse = modalAnkleTransverse;
    }
    return data;
  }, [internalModalBeatData.jointInfo, modalInternalActiveJoint, liveJointPanelEdits, modalAnkleSagittal, modalAnkleFrontal, modalAnkleTransverse]);

  const jointInfoForModalVisualizer = useMemo(() => {
    const base = { ...(internalModalBeatData.jointInfo || {}) };
    if (modalInternalActiveJoint && liveJointPanelEdits && typeof liveJointPanelEdits === 'object') {
      base[modalInternalActiveJoint] = { ...(base[modalInternalActiveJoint] || {}), ...liveJointPanelEdits };
      if (modalInternalActiveJoint === 'L_ANK' || modalInternalActiveJoint === 'R_ANK') {
        base[modalInternalActiveJoint].orientation_sagittal = modalAnkleSagittal;
        base[modalInternalActiveJoint].orientation_frontal = modalAnkleFrontal;
        base[modalInternalActiveJoint].orientation_transverse = modalAnkleTransverse;
      }
    }
    return base;
  }, [internalModalBeatData.jointInfo, modalInternalActiveJoint, liveJointPanelEdits, modalAnkleSagittal, modalAnkleFrontal, modalAnkleTransverse]);
  
  const relevantCoreJointsForVisualizer = useMemo(() => {
    const coreData = {};
    const jInfo = jointInfoForModalVisualizer || {};
    ['PELV', 'SPIN_L', 'SPIN_T', 'CHEST', 'NECK', 'HEAD'].forEach(coreJoint => {
      if (jInfo[coreJoint]) coreData[coreJoint] = jInfo[coreJoint];
    });
    return coreData;
  },[jointInfoForModalVisualizer]);

  const modalBeatGroundingData = internalModalBeatData.grounding || {L:null, R:null, L_weight: 50};
  const currentLeftWeightForDisplay = modalBeatGroundingData.L_weight !== undefined ? modalBeatGroundingData.L_weight : 50;
  
  const leftAnkleKey = useMemo(() => UI_LEFT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('ANK'))?.abbrev, []);
  const rightAnkleKey = useMemo(() => UI_RIGHT_JOINTS_ABBREVS_NEW.find(j => j.abbrev.includes('ANK'))?.abbrev, []);
  
  const modalLeftAnkleRotation = parseFloat(jointInfoForModalVisualizer?.[leftAnkleKey]?.rotation) || 0;
  const modalRightAnkleRotation = parseFloat(jointInfoForModalVisualizer?.[rightAnkleKey]?.rotation) || 0;

  if (!isOpen || !initialBeatDataForModal || typeof initialBeatDataForModal.id === 'undefined') return null;
  
  // Ensure currentBarSongData is an array of the correct length for MiniBeatPad display
  const displayableBarData = currentBarSongData && currentBarSongData.length > 0 
    ? currentBarSongData 
    : Array(DEFAULT_NUM_BEATS_PER_BAR_CONST).fill(null).map((_, i) => createDefaultBeatObject(i));


  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={modalTitle} size="6xl">
      <div className="mb-3 p-2 bg-gray-700/20 rounded-lg shadow">
        <h4 className="text-xs text-gray-300 mb-1.5 text-center font-semibold">
          Bar {initialBeatDataForModal?.barNumber || 'N/A'} Steps (Editing Step: {initialBeatDataForModal.id + 1})
        </h4>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
          {displayableBarData.map((beatStep, index) => (
            <MiniBeatPad
              key={`modal-pad-${initialBeatDataForModal?.barNumber}-${index}`}
              beatStepData={beatStep || createDefaultBeatObject(index)}
              stepIndex={index}
              isActive={index === initialBeatDataForModal.id}
              onClick={handleModalBeatPadClick} // Use the corrected handler
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 h-full max-h-[calc(80vh-12rem)]">
        <div className="lg:w-1/3 flex flex-col space-y-4 flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700/50 pr-2">
          {modalInternalActiveJoint ? (
            <JointInputPanel
              key={`${modalInternalActiveJoint}-${initialBeatDataForModal.id}`}
              initialJointData={initialDataForJointInputPanel}
              activeJointAbbrev={modalInternalActiveJoint}
              isAnkleJointActive={isAnkleCurrentlyActiveInModal}
              ankleSagittalOrient={modalAnkleSagittal} setAnkleSagittalOrient={setModalAnkleSagittal}
              ankleFrontalOrient={modalAnkleFrontal} setAnkleFrontalOrient={setModalAnkleFrontal}
              ankleTransverseOrient={modalAnkleTransverse} setAnkleTransverseOrient={setModalAnkleTransverse}
              onSaveJointDetails={handleSaveFromJointPanel}
              onClearJointDetails={handleClearFromJointPanel}
              onLiveChange={handleJointPanelLiveChange}
              logToConsole={logToConsoleFromParent}
            />
          ) : ( <div className="p-4 text-sm text-gray-400 italic text-center bg-gray-800/50 rounded-lg min-h-[200px] flex items-center justify-center"> Select a joint to edit. </div> )}
        </div>
        <div className="lg:w-1/3 flex flex-col space-y-3 flex-shrink-0 items-center">
          <div className="w-full p-2 border border-gray-700/80 rounded-lg bg-gray-800/40 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-1.5 px-1">
              <h4 className="text-xs sm:text-sm font-semibold text-pos-yellow font-orbitron">Pose Preview (Step {initialBeatDataForModal.id + 1})</h4>
              <Tooltip content={currentShowSkeletonLinesState ? "Hide Lines" : "Show Lines"} wrapperElementType="span">
                <Button variant="icon" size="sm" className="!p-1" onClick={onToggleSkeletonLinesInModal}>
                  <FontAwesomeIcon icon={currentShowSkeletonLinesState ? faEye : faEyeSlash} />
                </Button>
              </Tooltip>
            </div>
            <SkeletalPoseVisualizer2D
              jointInfoData={jointInfoForModalVisualizer} // Use this for live updates
              highlightJoint={modalInternalActiveJoint}
              width={200} height={260}
              showLines={currentShowSkeletonLinesState}
              onJointClick={handleJointClickInModalVisualizer}
              className="mx-auto bg-gray-800/10"
              useDotsInModal={true}
            />
          </div>
          <CoreDynamicsVisualizer
            coreJointData={relevantCoreJointsForVisualizer} // Use this for live updates
            beatGrounding={modalBeatGroundingData}
            onCoreInputChange={handleCoreDynamicsInputChangeInModal}
          />
        </div>
        <div className="lg:w-1/3 flex flex-col space-y-3 flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700/50 pr-2">
          <div className="p-3 border border-gray-700/80 rounded-lg bg-gray-800/40">
            <h4 className="label-text text-gray-200 text-base mb-1">Grounding & Weight</h4>
             {/* Foot Displays with Overlays */}
            <div className="flex flex-row justify-around items-center w-full pt-1 mb-2">
              <div className={`relative ${MODAL_FOOT_DISPLAY_SIZE_CLASSES} group`}>
                <FootDisplay side="L" groundPoints={modalBeatGroundingData?.L || null} type="image" sizeClasses="w-full h-full" rotation={modalLeftAnkleRotation} />
                <FootJoystickOverlay side="L" onGroundingChange={handleGroundingChangeFromJoystick} logToConsoleFromParent={logToConsoleFromParent} isActive={true}/>
              </div>
              <div className={`relative ${MODAL_FOOT_DISPLAY_SIZE_CLASSES} group`}>
                <FootDisplay side="R" groundPoints={modalBeatGroundingData?.R || null} type="image" sizeClasses="w-full h-full" rotation={modalRightAnkleRotation} />
                <FootJoystickOverlay side="R" onGroundingChange={handleGroundingChangeFromJoystick} logToConsoleFromParent={logToConsoleFromParent} isActive={true}/>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600/50">
              <label htmlFor={`modal-weight-slider-${initialBeatDataForModal.id}`} className="label-text text-sm mb-1 block text-center">
                L: {currentLeftWeightForDisplay}% - R: {100 - currentLeftWeightForDisplay}%
              </label>
              <input type="range" id={`modal-weight-slider-${initialBeatDataForModal.id}`} min="0" max="100" step="5" value={currentLeftWeightForDisplay} onChange={handleWeightChangeInModal} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-pos"/>
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <Button onClick={handleClearGroundingAndWeightFromModal} variant="dangerOutline" size="sm" className="text-xs"><FontAwesomeIcon icon={faTimesCircle} className="mr-1"/> Clear</Button>
              <Button onClick={handleSaveGroundingAndWeightFromModal} variant="success" size="sm" className="text-xs"><FontAwesomeIcon icon={faSave} className="mr-1"/> Save G&W</Button>
            </div>
          </div>
          <div className="p-3 border border-gray-700/80 rounded-lg bg-gray-800/40">
            <Input label="Syllable / Vocal Cue" id={`modal-syllable-${initialBeatDataForModal.id}`} type="text" value={internalModalBeatData.syllable || ''} onChange={handleSyllableChangeInModal} placeholder="e.g., 'Ah'" inputClassName="text-sm" />
            <div className="mt-2 flex justify-end"><Button onClick={handleSaveSyllableClickInModal} variant="secondary" size="sm" className="text-xs">Save Syllable</Button></div>
          </div>
          <div className="p-3 border border-gray-700/80 rounded-lg bg-gray-800/40">
            <Select label="Head Over Alignment Target" id={`modal-headOver-${initialBeatDataForModal.id}`} value={internalModalBeatData.headOver || 'None'} onChange={handleHeadOverChangeInModal} options={headOverOptionsForModal} selectClassName="py-1.5 text-sm" />
            <div className="mt-2 flex justify-end"><Button onClick={handleSaveHeadOverClickInModal} variant="secondary" size="sm" className="text-xs">Save Head Align</Button></div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

PoseEditorModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired,
  initialBeatDataForModal: PropTypes.object.isRequired, 
  initialActiveJointAbbrev: PropTypes.string,
  currentBarSongData: PropTypes.arrayOf(PropTypes.object), 
  onModalBeatSelect: PropTypes.func, // For navigating beats within the modal via parent
  onSaveGrounding: PropTypes.func.isRequired, 
  onSaveJointDetails: PropTypes.func.isRequired,
  onClearJointDetails: PropTypes.func.isRequired, 
  onClearGrounding: PropTypes.func.isRequired,
  onSaveSyllable: PropTypes.func.isRequired, 
  onSaveHeadOver: PropTypes.func.isRequired,
  logToConsoleFromParent: PropTypes.func, 
  currentShowSkeletonLinesState: PropTypes.bool,
  onToggleSkeletonLinesInModal: PropTypes.func, 
  onJointSelectInModal: PropTypes.func, // If parent needs to know about internal joint selection
};
PoseEditorModalComponent.defaultProps = {
  currentBarSongData: Array(DEFAULT_NUM_BEATS_PER_BAR_CONST).fill(null).map((_, i) => createDefaultBeatObject(i)),
  // Other defaults if necessary
};

export default React.memo(PoseEditorModalComponent);