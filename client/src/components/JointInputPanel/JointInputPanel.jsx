// client/src/components/JointInputPanel/JointInputPanel.jsx
import React, { useState, useEffect } from 'react';

const ROTATION_OPTS = ['IN', 'OUT', 'NEU', 'FLEX', 'EXT', 'ABD', 'ADD'];
const INTENT_OPTS = ['Strike', 'Hold', 'Flow', 'Pause', 'Pass', 'Land', 'Coil', 'Launch', 'Step', 'Chamber', 'Reset'];
const ENERGY_OPTS = ['Light', 'Medium', 'Strong', 'Explosive'];
// Example ground points - you might want a more dynamic list or free text
const GROUND_OPTS_L = ['L1','L2','L3','L12','L13','L23','L123','L1T1','L12T12','L123T123','LF123T12345'];
const GROUND_OPTS_R = ['R1','R2','R3','R12','R13','R23','R123','R1T1','R12T12','R123T123','RF123T12345'];


const JointInputPanel = ({ activeStepData, selectedJointForEdit, onSaveJointInfo, onSaveGroundingInfo }) => {
  const [rotation, setRotation] = useState('');
  const [vectorX, setVectorX] = useState(0);
  const [vectorY, setVectorY] = useState(0);
  const [vectorZ, setVectorZ] = useState(0);
  const [intent, setIntent] = useState('');
  const [energy, setEnergy] = useState('');
  const [groundPoint, setGroundPoint] = useState(''); // For grounding input

  useEffect(() => {
    const ji = activeStepData?.jointInfo;
    const gi = activeStepData?.grounding;

    if (ji && ji.joint === selectedJointForEdit) {
      setRotation(ji.rotation || '');
      setVectorX(ji.vector ? (ji.vector[0] ?? 0) : 0);
      setVectorY(ji.vector ? (ji.vector[1] ?? 0) : 0);
      setVectorZ(ji.vector ? (ji.vector[2] ?? 0) : 0);
      setIntent(ji.intent || '');
      setEnergy(ji.energy || '');
    } else {
      setRotation(''); setVectorX(0); setVectorY(0); setVectorZ(0); setIntent(''); setEnergy('');
    }

    setGroundPoint(gi?.type || ''); // Assuming grounding is { type: 'LF123' }

  }, [activeStepData, selectedJointForEdit]);

  const handleSaveJoint = () => {
    if (!selectedJointForEdit) {
      // alert("No joint selected in the matrix for editing."); // Or handle silently
      return;
    }
    onSaveJointInfo({
      joint: selectedJointForEdit,
      rotation,
      vector: [Number(vectorX), Number(vectorY), Number(vectorZ)],
      intent,
      energy,
    });
  };

  const handleSaveGrounding = () => {
    onSaveGroundingInfo({
        type: groundPoint,
        // Add side if your groundPoint strings don't inherently define it
        side: groundPoint.startsWith('L') ? 'L' : (groundPoint.startsWith('R') ? 'R' : null),
        // weight: 100 // Add weight later if needed
    });
  };

  if (!activeStepData) {
    return <div className="text-gray-500 p-3 text-xs text-center">Select a step from the sequencer above.</div>;
  }
  if (!selectedJointForEdit && !groundPoint) { // No joint chosen AND no ground point entered yet for this step
    // return <div className="text-gray-400 p-3 text-xs text-center">Select a joint from the matrix or enter grounding.</div>;
  }


  const inputStyle = "w-full p-1.5 bg-gray-700 text-white border border-gray-600 rounded-sm text-xs mb-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500";
  const labelStyle = "text-xs text-gray-400 mb-0.5 block font-medium";
  const buttonStyle = "w-full bg-sky-600 hover:bg-sky-700 text-white px-2 py-1.5 text-xs font-semibold rounded-sm mt-1 disabled:opacity-50";

  return (
    <div className="bg-gray-800 p-3 mt-1 rounded-md shadow-lg text-sm w-full max-w-xs">
      <h3 className="text-sm font-bold mb-3 text-center text-sky-400">
        Edit Step {activeStepData.id + 1}
      </h3>

      {/* Joint Specific Inputs */}
      {selectedJointForEdit && (
        <div className="mb-3 p-2 border border-gray-700 rounded-md">
            <p className="text-xs text-center font-semibold text-sky-300 mb-2">Joint: {selectedJointForEdit}</p>
            <label className={labelStyle}>Rotation:</label>
            <select value={rotation} onChange={(e) => setRotation(e.target.value)} className={inputStyle}>
                <option value="">- Select -</option>
                {ROTATION_OPTS.map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
            <label className={labelStyle}>Vector (X, Y, Z):</label>
            <div className="grid grid-cols-3 gap-1 mb-1">
                <div><input type="number" value={vectorX} onChange={e=>setVectorX(e.target.value)} className={inputStyle} /></div>
                <div><input type="number" value={vectorY} onChange={e=>setVectorY(e.target.value)} className={inputStyle} /></div>
                <div><input type="number" value={vectorZ} onChange={e=>setVectorZ(e.target.value)} className={inputStyle} /></div>
            </div>
            <label className={labelStyle}>Intent:</label>
            <select value={intent} onChange={(e) => setIntent(e.target.value)} className={inputStyle}>
                <option value="">- Select -</option>
                {INTENT_OPTS.map(i => (<option key={i} value={i}>{i}</option>))}
            </select>
            <label className={labelStyle}>Energy:</label>
            <select value={energy} onChange={(e) => setEnergy(e.target.value)} className={inputStyle}>
                <option value="">- Select -</option>
                {ENERGY_OPTS.map(en => (<option key={en} value={en}>{en}</option>))}
            </select>
            <button onClick={handleSaveJoint} className={buttonStyle} disabled={!selectedJointForEdit}>Save Joint Details</button>
        </div>
      )}

      {/* Grounding Input */}
       <div className="p-2 border border-gray-700 rounded-md">
        <label className={`${labelStyle} text-center font-semibold text-emerald-300 mb-2`}>Ground Point:</label>
        <select value={groundPoint} onChange={(e) => setGroundPoint(e.target.value)} className={inputStyle}>
            <option value="">- None -</option>
            <optgroup label="Left Foot">
                {GROUND_OPTS_L.map(g => (<option key={g} value={g}>{g}</option>))}
            </optgroup>
            <optgroup label="Right Foot">
                {GROUND_OPTS_R.map(g => (<option key={g} value={g}>{g}</option>))}
            </optgroup>
        </select>
        {/* Or use your GroundPointSelector component if it's more advanced */}
        {/* <GroundPointSelector value={groundPoint} onChange={(side, val) => setGroundPoint(val)} /> */}
        <button onClick={handleSaveGrounding} className={`${buttonStyle} bg-emerald-600 hover:bg-emerald-700`} disabled={!groundPoint && !activeStepData?.grounding}>
            {activeStepData?.grounding && !groundPoint ? 'Clear Grounding' : 'Save Grounding'}
        </button>
      </div>
    </div>
  );
};

export default JointInputPanel;