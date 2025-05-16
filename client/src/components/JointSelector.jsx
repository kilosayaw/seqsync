// src/components/JointSelector.jsx
import React from 'react';

const joints = ['LS', 'RS', 'LE', 'RE', 'LW', 'RW', 'LH', 'RH', 'LK', 'RK', 'LA', 'RA'];

const JointSelector = ({ beatData, activeBeat, setBeatData }) => {
  const currentJoint = beatData[activeBeat]?.joint;

  const handleSelect = (joint) => {
    const updated = { ...beatData[activeBeat], joint };
    const updatedBeats = [...beatData];
    updatedBeats[activeBeat] = updated;
    setBeatData(updatedBeats);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      {joints.map(joint => (
        <button
          key={joint}
          onClick={() => handleSelect(joint)}
          className={`px-3 py-2 rounded text-sm font-bold transition 
            ${joint === currentJoint ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'}`}
        >
          {joint}
        </button>
      ))}
    </div>
  );
};

export default JointSelector;
