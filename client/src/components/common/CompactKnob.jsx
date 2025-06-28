// [UPGRADED] src/components/common/CompactKnob.jsx
import React from 'react';
import PropTypes from 'prop-types';
import RotationKnob from './RotationKnob';

// This is now a more generic, small knob component without a built-in label.
const CompactKnob = ({ value, onChange }) => {
  return (
    <RotationKnob 
      value={value} 
      onChange={onChange} 
      size={36}
      showValue={false} // Hides the 50.0° text inside the knob
    />
  );
};

CompactKnob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CompactKnob;