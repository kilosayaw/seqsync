// src/components/common/Input.jsx
import React, { useId } from 'react'; // Added useId (React 18+)
import PropTypes from 'prop-types';

const Input = React.memo(React.forwardRef(
  (
    {
      type = 'text',
      id: idProp, // Renamed to avoid conflict with generated id
      name: nameProp,
      value,
      onChange,
      onBlur,
      placeholder,
      className = '',             // For the outer div wrapper
      inputContainerClassName = '', // For the div directly wrapping the input and icon
      inputClassName = '',        // For the <input> or <textarea> element itself
      label,
      error,
      disabled = false,       // Default to false
      required = false,       // Default to false
      iconLeft,
      // Capture any other native input attributes
      ...restProps
    },
    ref
  ) => {
    // Generate a unique ID if not provided, for label association and aria attributes
    const generatedId = useId();
    const id = idProp || generatedId;
    const name = nameProp || id; // Use id as name if name is not provided

    const baseInputClasses = "input-field"; // Should be defined in your global CSS / Tailwind base
                                          // e.g., appearance-none block w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-150 ease-in-out
                                          // and also text-white (or appropriate text color for your theme)
    const hasIconLeft = !!iconLeft;
    const errorId = error ? `${id}-error` : undefined;

    const commonInputProps = {
      id,
      name,
      ref,
      value: value === null || value === undefined ? '' : value, // Handle null/undefined for controlled components
      onChange,
      onBlur,
      placeholder,
      disabled,
      required,
      className: `${baseInputClasses} ${hasIconLeft ? 'pl-10' : 'px-3'} ${inputClassName} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-1' : 'border-gray-600 focus:border-brand-accent focus:ring-brand-accent ring-1 focus:ring-opacity-50'} ${disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-gray-100 hover:border-gray-500'}`,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': errorId,
      ...restProps,
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id} className="label-text block text-sm font-medium text-gray-300 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`relative flex items-center rounded-md shadow-sm ${inputContainerClassName}`}>
          {hasIconLeft && (
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {/* Ensure icon is sized appropriately, e.g., using FontAwesomeIcon size prop or CSS */}
              {React.isValidElement(iconLeft) ? React.cloneElement(iconLeft, { className: 'h-5 w-5' }) : iconLeft}
            </span>
          )}
          {type === 'textarea' ? (
            <textarea
              {...commonInputProps}
              // Textareas might need specific height/rows, passed via restProps or inputClassName
              // Ensure input-field in CSS handles min-height for textareas or set rows
              rows={restProps.rows || 3} // Example default rows for textarea
            />
          ) : (
            <input
              type={type}
              {...commonInputProps}
            />
          )}
        </div>
        {error && <p id={errorId} className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
));

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string, // For the main wrapper div
  inputContainerClassName: PropTypes.string, // For the div around input+icon
  inputClassName: PropTypes.string, // For the actual input/textarea element
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  iconLeft: PropTypes.node, // Can be a React node (e.g., SVG, FontAwesomeIcon)
};

// No defaultProps static block needed due to JS default parameters

export default Input;