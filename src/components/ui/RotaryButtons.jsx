// src/components/ui/RotaryButtons.jsx

import React from 'react';
import './RotaryButtons.css';

const RotaryButtons = () => {
    // Note: The `onClick` handlers and state management for these
    // buttons will be implemented in a later phase.
  return (
    <div className="rotary-buttons-container">
      <button className="rotary-btn">UP/DOWN</button>
      <button className="rotary-btn">L/R</button>
      <button className="rotary-btn">FWD/BWD</button>
    </div>
  );
};

export default RotaryButtons;