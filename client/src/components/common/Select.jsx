// src/components/common/Select.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Select = React.forwardRef(
  ({ id, name, value, onChange, options = [], className = '', selectClassName = '', label, error, disabled, required, placeholder, ...props }, ref) => {
    const baseSelectClasses = "input-select"; // Defined in index.css

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id || name} className="label-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={id || name}
          name={name || id}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseSelectClasses} ${selectClassName} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-brand-accent focus:ring-brand-accent'} ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700'}`}
          {...props}
        >
          {placeholder && <option value="" disabled={value !== ""}>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

Select.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string, 
  selectClassName: PropTypes.string, 
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default Select;