// src/components/StepSequencer.jsx
import React from 'react';

const StepSequencer = ({ beatData, activeBeat, onStepClick }) => {
  return (
    <div className="flex gap-1 mb-4 justify-center">
      {beatData.map((step, index) => (
        <button
          key={index}
          onClick={() => onStepClick(index)}
          className={`w-8 h-8 rounded ${
            index === activeBeat ? 'bg-green-500' : 'bg-gray-700'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default StepSequencer;
