import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const Crossfader = ({ value, onChange, className = '' }) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="text-xs font-bold text-blue-400 mr-2">L</span>
      <input
        type="range"
        min="0"
        max="100"
        value={internalValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <span className="text-xs font-bold text-red-400 ml-2">R</span>
    </div>
  );
};
Crossfader.propTypes = { value: PropTypes.number.isRequired, onChange: PropTypes.func.isRequired, className: PropTypes.string };
export default Crossfader;