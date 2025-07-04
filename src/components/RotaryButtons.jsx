// src/components/RotaryButtons.jsx
import React from 'react';
import './RotaryButtons.css';

const RotaryButtons = () => {
  return (
    <div className="rotary-buttons-container">
      <button className="rotary-btn">UP/DOWN</button>
      <button className="rotary-btn">L/R</button>
      <button className="rotary-btn">FWD/BWD</button>
    </div>
  );
};
export default RotaryButtons;