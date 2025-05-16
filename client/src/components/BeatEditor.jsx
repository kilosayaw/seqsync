// src/components/BeatEditor.jsx
import React from 'react';

const BeatEditor = ({ activeBeat, beatData, setBeatData }) => {
  const beat = beatData[activeBeat] || {};

  const updateField = (field, value) => {
    const updated = { ...beat, [field]: value };
    const updatedBeats = [...beatData];
    updatedBeats[activeBeat] = updated;
    setBeatData(updatedBeats);
  };

  const inputStyle = 'w-full p-1 bg-black text-white border rounded';

  return (
    <div className="bg-gray-900 p-4 mt-6 rounded shadow text-sm">
      <h2 className="text-lg font-bold mb-2">🛠 Beat Editor</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label>Joint</label>
          <input value={beat.joint} onChange={(e) => updateField('joint', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label>Rotation</label>
          <input value={beat.rotation} onChange={(e) => updateField('rotation', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label>Vector X</label>
          <input type="number" value={beat.vector_x} onChange={(e) => updateField('vector_x', Number(e.target.value))} className={inputStyle} />
        </div>
        <div>
          <label>Vector Y</label>
          <input type="number" value={beat.vector_y} onChange={(e) => updateField('vector_y', Number(e.target.value))} className={inputStyle} />
        </div>
        <div>
          <label>Vector Z</label>
          <input type="number" value={beat.vector_z} onChange={(e) => updateField('vector_z', Number(e.target.value))} className={inputStyle} />
        </div>
        <div>
          <label>Ground Point</label>
          <input value={beat.ground_point} onChange={(e) => updateField('ground_point', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label>Intent</label>
          <input value={beat.intent} onChange={(e) => updateField('intent', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label>Energy</label>
          <input value={beat.energy} onChange={(e) => updateField('energy', e.target.value)} className={inputStyle} />
        </div>
      </div>
    </div>
  );
};

export default BeatEditor;
