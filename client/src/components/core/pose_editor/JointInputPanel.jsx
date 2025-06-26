// SEGSYNC/client/src/components/core/pose_editor/JointInputPanel.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import RotationKnob from '../../common/RotationKnob';
import Button from '../../common/Button';
import Select from '../../common/Select';
import Input from '../../common/Input'; // Assuming Input is a styled common component
import Tooltip from '../../common/Tooltip';
import { ALL_JOINTS_MAP } from '../../../utils/sounds';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave, faTimesCircle, faArrowUp, faArrowDown, faArrowLeft, faArrowRight,
    faRedo, faUndo, 
    faCrosshairs 
} from '@fortawesome/free-solid-svg-icons';

import {
    GENERAL_ORIENTATION_OPTIONS, INTENT_OPTIONS,
    ANKLE_SAGITTAL_OPTIONS, ANKLE_FRONTAL_OPTIONS, ANKLE_TRANSVERSE_OPTIONS,
    DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT,
    DEFAULT_JOINT_ENERGY,     // Changed from DEFAULT_ENERGY_VALUE for consistency
    ENERGY_LEVEL_LABELS,      
    DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
    Z_DEPTH_CONFIG, Z_RENDER_ORDER, VECTOR_GRID_CELLS,
    NUDGE_INCREMENT_OPTIONS, DEFAULT_NUDGE_INCREMENT, // Added these
    VECTOR_GRID_INCREMENT // Added this
} from '../../../utils/constants'; 

export const JointInputPanel = ({
  initialJointData, activeJointAbbrev,
  onSaveJointDetails, onClearJointDetails, onLiveChange,
  logToConsole,
  isAnkleJointActive: parentIsAnkleJointActive,
  ankleSagittalOrient: parentAnkleSagittal, setAnkleSagittalOrient: parentSetAnkleSagittal,
  ankleFrontalOrient: parentAnkleFrontal, setAnkleFrontalOrient: parentSetAnkleFrontal,
  ankleTransverseOrient: parentAnkleTransverse, setAnkleTransverseOrient: parentSetAnkleTransverse,
}) => {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentOrientation, setCurrentOrientation] = useState(DEFAULT_GENERAL_ORIENTATION);
  const [currentVector, setCurrentVector] = useState({ x: 0, y: 0, z: 0, x_base_direction: 0, y_base_direction: 0 });
  const [currentIntent, setCurrentIntent] = useState(DEFAULT_INTENT);
  const [currentEnergy, setCurrentEnergy] = useState(DEFAULT_JOINT_ENERGY);
  const [displacementIncrement, setDisplacementIncrement] = useState(DEFAULT_NUDGE_INCREMENT);

  const isAnkleJoint = useMemo(() => parentIsAnkleJointActive, [parentIsAnkleJointActive]);

  useEffect(() => {
    const data = initialJointData || {};
    logToConsole?.(`[JIP] Populating for ${activeJointAbbrev} with:`, data);
    setCurrentRotation(parseFloat(data.rotation) || 0);
    setCurrentOrientation(data.orientation || DEFAULT_GENERAL_ORIENTATION);
    setCurrentVector(data.vector || { x: 0, y: 0, z: 0, x_base_direction: 0, y_base_direction: 0 });
    setCurrentIntent(data.intent || DEFAULT_INTENT);
    setCurrentEnergy(data.energy !== undefined ? parseFloat(data.energy) : DEFAULT_JOINT_ENERGY);
    setDisplacementIncrement(data.fine_nudge_increment || DEFAULT_NUDGE_INCREMENT); // Populate if saved

    if (isAnkleJoint) {
      parentSetAnkleSagittal(data.orientation_sagittal || DEFAULT_ANKLE_SAGITTAL);
      parentSetAnkleFrontal(data.orientation_frontal || DEFAULT_ANKLE_FRONTAL);
      parentSetAnkleTransverse(data.orientation_transverse || DEFAULT_ANKLE_TRANSVERSE);
    }
  }, [activeJointAbbrev, initialJointData, isAnkleJoint, logToConsole, parentSetAnkleSagittal, parentSetAnkleFrontal, parentSetAnkleTransverse]);

  const buildCurrentDetails = useCallback(() => {
    const numericRotation = parseFloat(currentRotation);
    const finalRotation = isNaN(numericRotation) ? 0 : Math.max(-180, Math.min(180, Math.round(numericRotation)));
    const details = {
      rotation: finalRotation,
      orientation: currentOrientation,
      vector: { // Ensure all vector components are included
        x: currentVector.x,
        y: currentVector.y,
        z: currentVector.z,
        x_base_direction: currentVector.x_base_direction,
        y_base_direction: currentVector.y_base_direction
      },
      intent: currentIntent,
      energy: parseFloat(currentEnergy) || 0,
      fine_nudge_increment: displacementIncrement, // Save the selected increment
    };
    if (isAnkleJoint) {
      details.orientation_sagittal = parentAnkleSagittal;
      details.orientation_frontal = parentAnkleFrontal;
      details.orientation_transverse = parentAnkleTransverse;
    }
    return details;
  }, [currentRotation, currentOrientation, currentVector, currentIntent, currentEnergy, isAnkleJoint, parentAnkleSagittal, parentAnkleFrontal, parentAnkleTransverse, displacementIncrement]);

  useEffect(() => {
    if (onLiveChange && activeJointAbbrev) { onLiveChange(buildCurrentDetails()); }
  }, [activeJointAbbrev, buildCurrentDetails, onLiveChange]);

  const handleRotationLiveChange = useCallback((newRotation) => setCurrentRotation(newRotation), []);
  const handleRotationFinalize = useCallback((val) => {
    const num = parseFloat(val); setCurrentRotation(Math.max(-180, Math.min(180, Math.round(isNaN(num) ? 0 : num))));
  }, []);
  const handleRotationInputChange = useCallback((e) => setCurrentRotation(e.target.value), []);
  const handleGeneralOrientationChange = useCallback((e) => setCurrentOrientation(e.target.value), []);
  const handleIntentChange = useCallback((e) => setCurrentIntent(e.target.value), []);
  const handleEnergySliderChange = useCallback((e) => setCurrentEnergy(parseFloat(e.target.value)), []);
  const handleAnkleSagittalChange = useCallback((e) => parentSetAnkleSagittal(e.target.value), [parentSetAnkleSagittal]);
  const handleAnkleFrontalChange = useCallback((e) => parentSetAnkleFrontal(e.target.value), [parentSetAnkleFrontal]);
  const handleAnkleTransverseChange = useCallback((e) => parentSetAnkleTransverse(e.target.value), [parentSetAnkleTransverse]);
  const handleDisplacementIncrementChange = useCallback((e) => setDisplacementIncrement(parseFloat(e.target.value)), []);

  const handleVectorCellClick = useCallback((targetCellX, targetCellY) => {
    setCurrentVector(prevVector => {
      let newX, newY;
      let newZ = prevVector.z; // Default to current Z
      let newBaseX = targetCellX;
      let newBaseY = targetCellY;

      if (targetCellX === 0 && targetCellY === 0) { // Click on center cell (0,0)
        newX = 0;
        newY = 0;
        // If already at center XY, cycle Z. Otherwise, keep current Z when snapping to center.
        if (prevVector.x === 0 && prevVector.y === 0) {
            const currentZIndex = Z_RENDER_ORDER.indexOf(prevVector.z);
            newZ = Z_RENDER_ORDER[(currentZIndex + 1) % Z_RENDER_ORDER.length];
        }
      } else { // Clicked a directional cell
        // If clicking the same base XY direction again, only cycle Z.
        if (prevVector.x_base_direction === targetCellX && prevVector.y_base_direction === targetCellY) {
            const currentZIndex = Z_RENDER_ORDER.indexOf(prevVector.z);
            newZ = Z_RENDER_ORDER[(currentZIndex + 1) % Z_RENDER_ORDER.length];
            newX = prevVector.x; // Keep current nudged X
            newY = prevVector.y; // Keep current nudged Y
            newBaseX = prevVector.x_base_direction; // Base direction doesn't change
            newBaseY = prevVector.y_base_direction;
        } else { // Clicked a new directional cell: set vector components based on fixed VECTOR_GRID_INCREMENT
            newX = parseFloat((targetCellX * VECTOR_GRID_INCREMENT).toFixed(2));
            newY = parseFloat((targetCellY * VECTOR_GRID_INCREMENT).toFixed(2));
            newZ = 0; // Reset Z to Middle when XY primary direction changes
        }
      }
      
      const newVectorState = {
        x: Math.max(-1, Math.min(1, newX)),
        y: Math.max(-1, Math.min(1, newY)),
        z: newZ,
        x_base_direction: newBaseX,
        y_base_direction: newBaseY
      };
      logToConsole?.(`[JIP] Vector grid click. Target: (${targetCellX},${targetCellY}). New state:`, newVectorState);
      return newVectorState;
    });
  }, [logToConsole, VECTOR_GRID_INCREMENT]); // VECTOR_GRID_INCREMENT is a constant

  const nudgeVectorFine = useCallback((dx, dy, dzCycleDirection = 0) => {
    setCurrentVector(prev => {
      let { x, y, z, x_base_direction, y_base_direction } = prev; // Destructure base directions
      if (dzCycleDirection !== 0) {
        const currentZIndex = Z_RENDER_ORDER.indexOf(z);
        z = Z_RENDER_ORDER[(currentZIndex + dzCycleDirection + Z_RENDER_ORDER.length) % Z_RENDER_ORDER.length];
      } else {
        x = parseFloat((x + (dx * displacementIncrement)).toFixed(3)); // Use 3 decimal places for finer control
        y = parseFloat((y + (dy * displacementIncrement)).toFixed(3));
      }
      return {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        z: z,
        x_base_direction: x_base_direction, // Preserve base direction
        y_base_direction: y_base_direction
      };
    });
  }, [displacementIncrement]);

  const resetVector = useCallback(() => setCurrentVector({x:0, y:0, z:0, x_base_direction:0, y_base_direction:0}), []);

  const handleSave = useCallback(() => onSaveJointDetails(activeJointAbbrev, buildCurrentDetails()), [activeJointAbbrev, buildCurrentDetails, onSaveJointDetails]);
  const handleClear = useCallback(() => {
    setCurrentRotation(0); setCurrentOrientation(DEFAULT_GENERAL_ORIENTATION);
    resetVector();
    setCurrentIntent(DEFAULT_INTENT); setCurrentEnergy(DEFAULT_JOINT_ENERGY);
    setDisplacementIncrement(DEFAULT_NUDGE_INCREMENT);
    if (isAnkleJoint) {
      parentSetAnkleSagittal(DEFAULT_ANKLE_SAGITTAL); parentSetAnkleFrontal(DEFAULT_ANKLE_FRONTAL); parentSetAnkleTransverse(DEFAULT_ANKLE_TRANSVERSE);
    }
    onClearJointDetails(activeJointAbbrev);
  }, [activeJointAbbrev, isAnkleJoint, onClearJointDetails, parentSetAnkleSagittal, parentSetAnkleFrontal, parentSetAnkleTransverse, resetVector]);

  const jointLabel = useMemo(() => activeJointAbbrev ? (ALL_JOINTS_MAP[activeJointAbbrev]?.name || activeJointAbbrev) : 'N/A', [activeJointAbbrev]);

  const currentEnergyLabel = useMemo(() => {
    const energyVal = parseFloat(currentEnergy);
    if (isNaN(energyVal)) return ENERGY_LEVEL_LABELS.MEDIUM; // Default if NaN
    const numericEnergy = Math.max(0, Math.min(100, energyVal)); // Clamp value
    if (numericEnergy <= 33) return ENERGY_LEVEL_LABELS.LOW;
    if (numericEnergy <= 66) return ENERGY_LEVEL_LABELS.MEDIUM;
    return ENERGY_LEVEL_LABELS.HIGH;
  }, [currentEnergy]);


  if (!activeJointAbbrev) return <div className="p-4 text-sm text-gray-500 italic text-center bg-gray-800/30 rounded-lg">Select a joint.</div>;

  return (
    <div className="p-3 sm:p-4 border border-gray-700 rounded-lg bg-gray-800/60 shadow-xl">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-pos-yellow font-orbitron">Edit: {jointLabel}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 items-start">
        {/* Rotation Section */}
        <div className="flex flex-col items-center space-y-1">
          <label className="label-text text-center">Rotation: <span className="font-digital text-lg text-pos-yellow">{parseFloat(currentRotation).toFixed(0)}°</span></label>
          <RotationKnob value={parseFloat(currentRotation) || 0} onChange={handleRotationLiveChange} onKnobChangeEnd={handleRotationFinalize} min={-180} max={180} step={1} sensitivity={isAnkleJoint ? 0.4 : 0.6} size={90} label={isAnkleJoint ? "Primary Ankle Angle" : "Joint Angle"} knobColor="bg-gray-700/80" trackColor="stroke-gray-600/70" indicatorColor="stroke-brand-pos" dotColor="fill-brand-pos"/>
          <Input type="number" value={String(currentRotation)} onChange={handleRotationInputChange} onBlur={() => handleRotationFinalize(currentRotation)} inputClassName="w-24 text-center !py-1 !text-xs" min="-180" max="180" step="0.1"/>
        </div>

        {/* Displacement & Depth Section */}
        <div className="flex flex-col items-center space-y-1">
          <label className="label-text text-center">Displacement (Grid Click: ±{VECTOR_GRID_INCREMENT.toFixed(2)}) & Depth (Z: {Z_DEPTH_CONFIG[String(currentVector.z)]?.label || 'M'})</label>
          <div className="grid grid-cols-3 gap-px w-32 h-32 sm:w-36 sm:h-36 bg-gray-900/50 p-0.5 rounded-md shadow-inner border border-gray-600/50">
            {VECTOR_GRID_CELLS.map(cell => {
              const isCellBaseDirection = currentVector.x_base_direction === cell.x && currentVector.y_base_direction === cell.y && !(cell.x === 0 && cell.y ===0);
              const isCenterCellSelected = currentVector.x === 0 && currentVector.y === 0 && cell.x === 0 && cell.y === 0;
              const isCellCurrentlyRepresented = (isCellBaseDirection || isCenterCellSelected) && (Math.abs(currentVector.x - (cell.x * VECTOR_GRID_INCREMENT)) < (VECTOR_GRID_INCREMENT/2) && Math.abs(currentVector.y - (cell.y * VECTOR_GRID_INCREMENT)) < (VECTOR_GRID_INCREMENT/2) || (cell.x === 0 && cell.y === 0 && currentVector.x === 0 && currentVector.y === 0));


              return (
                <div key={`vcell-${cell.x}-${cell.y}`} 
                     className={`relative w-full h-full rounded-sm flex items-center justify-center transition-all duration-100 cursor-pointer 
                                ${isCellCurrentlyRepresented ? 'bg-gray-500 ring-1 ring-brand-pos/70' : 'bg-gray-700/60 hover:bg-gray-600/70'}`}
                     onClick={() => handleVectorCellClick(cell.x, cell.y)} 
                     title={`${cell.desc}. Click to displace by ±${VECTOR_GRID_INCREMENT.toFixed(2)}. Click active XY to cycle Z.`}>
                  {Z_RENDER_ORDER.map(zValue => {
                    const style = Z_DEPTH_CONFIG[String(zValue)];
                    const isThisZActiveForCell = isCellCurrentlyRepresented && currentVector.z === zValue;
                    return <div key={`zbtn-${cell.x}-${cell.y}-${zValue}`} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white text-[0.5rem] font-bold leading-none transition-all duration-150 transform pointer-events-none ${style.sizeClasses} ${isThisZActiveForCell ? `${style.activeColor} ${style.ring} scale-100 shadow-md z-30` : `${style.color} opacity-40 ${(isCellCurrentlyRepresented) ? 'group-hover:opacity-70' : ''} ${zValue === -1 ? 'z-10' : (zValue === 0 ? 'z-20' : 'z-0')}`}`}>{style.label}</div>;
                  })}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">XYZ: [{currentVector.x.toFixed(3)}, {currentVector.y.toFixed(3)}, {currentVector.z}]</p>
          <div className="mt-1 w-full max-w-[180px] space-y-0.5">
            <p className="text-xxs text-center text-gray-500 mb-0.5">Fine Nudge (±{displacementIncrement.toFixed(3)})</p>
            <div className="flex justify-center"><Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(0, 1)} title={`Nudge Up (Y+) by ${displacementIncrement.toFixed(3)}`} className="!px-3 !py-1 w-full"><FontAwesomeIcon icon={faArrowUp}/></Button></div>
            <div className="flex justify-between items-center gap-0.5">
              <Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(-1, 0)} title={`Nudge Left (X-) by ${displacementIncrement.toFixed(3)}`} className="!px-3 !py-1 flex-1"><FontAwesomeIcon icon={faArrowLeft}/></Button>
              <Tooltip content="Reset Vector to (0,0,0)"><Button size="xs" variant="icon" onClick={resetVector} className="!p-1.5 text-yellow-400 hover:text-yellow-300"><FontAwesomeIcon icon={faCrosshairs}/></Button></Tooltip>
              <Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(1, 0)} title={`Nudge Right (X+) by ${displacementIncrement.toFixed(3)}`} className="!px-3 !py-1 flex-1"><FontAwesomeIcon icon={faArrowRight}/></Button>
            </div>
            <div className="flex justify-center"><Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(0, -1)} title={`Nudge Down (Y-) by ${displacementIncrement.toFixed(3)}`} className="!px-3 !py-1 w-full"><FontAwesomeIcon icon={faArrowDown}/></Button></div>
            <div className="flex justify-between items-center gap-0.5 mt-1">
                <Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(0,0, -1)} title="Cycle Z Depth Nearer" className="!px-3 !py-1 flex-1">Z <FontAwesomeIcon icon={faUndo} className="ml-1 text-xs"/></Button>
                <Button size="xs" variant="secondary" onClick={() => nudgeVectorFine(0,0, 1)} title="Cycle Z Depth Farther" className="!px-3 !py-1 flex-1">Z <FontAwesomeIcon icon={faRedo} className="ml-1 text-xs"/></Button>
            </div>
          </div>
          <div className="mt-1.5 w-full max-w-[180px]"><Select label="Nudge Increment" id={`jip-disp-inc-${activeJointAbbrev}`} value={displacementIncrement} onChange={handleDisplacementIncrementChange} options={NUDGE_INCREMENT_OPTIONS} selectClassName="!py-1 !text-xxs h-7" labelClassName="!text-xxs !mb-0.5"/></div>
        </div>

        {/* Dropdowns & Sliders Section */}
        <div className="space-y-3 md:col-span-2 lg:col-span-1">
          {!isAnkleJoint && <Select label="General Orientation" id={`jip-orientation-${activeJointAbbrev}`} value={currentOrientation} onChange={handleGeneralOrientationChange} options={GENERAL_ORIENTATION_OPTIONS} selectClassName="!py-1.5 !text-xs"/>}
          {isAnkleJoint && (<>
              <Select label="Ankle: Sagittal Plane" id={`jip-ank-sag-${activeJointAbbrev}`} value={parentAnkleSagittal} onChange={handleAnkleSagittalChange} options={ANKLE_SAGITTAL_OPTIONS} selectClassName="!py-1.5 !text-xs"/>
              <Select label="Ankle: Frontal Plane" id={`jip-ank-fron-${activeJointAbbrev}`} value={parentAnkleFrontal} onChange={handleAnkleFrontalChange} options={ANKLE_FRONTAL_OPTIONS} selectClassName="!py-1.5 !text-xs"/>
              <Select label="Ankle: Transverse Plane" id={`jip-ank-tran-${activeJointAbbrev}`} value={parentAnkleTransverse} onChange={handleAnkleTransverseChange} options={ANKLE_TRANSVERSE_OPTIONS} selectClassName="!py-1.5 !text-xs"/>
          </>)}
          <Select label="Intent" id={`jip-intent-${activeJointAbbrev}`} value={currentIntent} onChange={handleIntentChange} options={INTENT_OPTIONS} selectClassName="!py-1.5 !text-xs"/>
          <div>
            <label htmlFor={`energy-slider-${activeJointAbbrev}`} className="label-text">Energy: {currentEnergyLabel} ({parseFloat(currentEnergy).toFixed(0)})</label>
            <input type="range" id={`energy-slider-${activeJointAbbrev}`} min="0" max="100" step="1" value={currentEnergy} onChange={handleEnergySliderChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-1"/>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-700/60">
        <Button onClick={handleClear} variant="dangerOutline" size="sm" title="Clear all data for this joint"><FontAwesomeIcon icon={faTimesCircle} className="mr-1.5"/> Clear Data</Button>
        <Button onClick={handleSave} variant="success" size="sm" title="Save current details for this joint to the beat"><FontAwesomeIcon icon={faSave} className="mr-1.5"/> Save Details</Button>
      </div>
    </div>
  );
};

JointInputPanel.propTypes = {
  initialJointData: PropTypes.object,
  activeJointAbbrev: PropTypes.string,
  onSaveJointDetails: PropTypes.func.isRequired,
  onClearJointDetails: PropTypes.func.isRequired,
  onLiveChange: PropTypes.func,
  logToConsole: PropTypes.func,
  isAnkleJointActive: PropTypes.bool.isRequired,
  ankleSagittalOrient: PropTypes.string.isRequired,
  setAnkleSagittalOrient: PropTypes.func.isRequired,
  ankleFrontalOrient: PropTypes.string.isRequired,
  setAnkleFrontalOrient: PropTypes.func.isRequired,
  ankleTransverseOrient: PropTypes.string.isRequired,
  setAnkleTransverseOrient: PropTypes.func.isRequired,
};