// src/components/common/ToggleButton.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ToggleButton = ({
  onClick,
  isActive,
  children,
  className = "",
  activeClassName = "bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-400",
  inactiveClassName = "bg-gray-600 hover:bg-gray-500 text-gray-300",
  title = "",
  disabled = false,
  ariaLabel,
  ...props
}) => {
  const effectiveAriaLabel = ariaLabel || (typeof title === 'string' && title ? title : (typeof children === 'string' ? children : 'Toggle Button'));

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={effectiveAriaLabel}
      className={`
        px-3 py-2 rounded-md text-sm font-medium 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        transition-colors duration-150 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isActive ? activeClassName : inactiveClassName}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

ToggleButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  inactiveClassName: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

export default ToggleButton;