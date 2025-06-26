// src/components/common/Input.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(
  (
    { 
      type = 'text', 
      id, 
      name, 
      value, 
      onChange, 
      onBlur,
      placeholder, 
      className = '', 
      inputContainerClassName = '',
      inputClassName = '',   
      label, 
      error, 
      disabled, 
      required, 
      iconLeft,
      ...restProps 
    }, 
    ref
  ) => {
    const baseInputClasses = "input-field"; // Defined in index.css
    const hasIconLeft = !!iconLeft;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id || name} className="label-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`relative flex items-center ${inputContainerClassName}`}>
          {hasIconLeft && (
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {iconLeft}
            </span>
          )}
          {type === 'textarea' ? (
            <textarea
              id={id || name}
              name={name || id}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={`${baseInputClasses} ${hasIconLeft ? 'pl-10' : ''} ${inputClassName} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-brand-accent focus:ring-brand-accent'} ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700'}`}
              {...restProps}
            />
          ) : (
            <input
              type={type}
              id={id || name}
              name={name || id}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={`${baseInputClasses} ${hasIconLeft ? 'pl-10' : ''} ${inputClassName} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-brand-accent focus:ring-brand-accent'} ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700'}`}
              {...restProps}
            />
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  iconLeft: PropTypes.node,
};

export default Input;