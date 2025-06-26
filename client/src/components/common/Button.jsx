// src/components/common/Button.jsx (Hypothetical Example)
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md', // Default size
  className = '',
  disabled = false,
  iconLeft,
  iconRight,
  iconProps = {},
  type = 'button',
  title,
  // ... other props
}) => {
  const baseClasses = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 items-center justify-center inline-flex";
  
  let variantClasses = '';
  // ... (your existing variant class logic)
  switch (variant) {
    case 'primary': variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'; break;
    case 'secondary': variantClasses = 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'; break;
    case 'danger': variantClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'; break;
    case 'success': variantClasses = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'; break;
    case 'icon': variantClasses = 'text-gray-400 hover:text-gray-200 focus:ring-indigo-500'; break;
    // Add other variants
    default: variantClasses = 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'; break;
  }

  let sizeClasses = '';
  // Example of adding 'sm' size
  switch (size) {
    case 'sm': // New 'sm' size
      sizeClasses = 'px-2.5 py-1.5 text-xs'; // Adjusted padding and text for 'sm'
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base';
      break;
    case 'custom': // If you have a custom size that relies on external classes
      sizeClasses = ''; 
      break;
    default:
      sizeClasses = 'px-4 py-2 text-sm'; // Fallback to md
  }

  if (variant === 'icon') { // Icon buttons might have different padding
    switch (size) {
        case 'sm': sizeClasses = 'p-1.5'; break; // Adjusted for icon button
        case 'md': sizeClasses = 'p-2'; break;
        case 'lg': sizeClasses = 'p-2.5'; break;
        default: sizeClasses = 'p-2';
    }
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      title={title}
    >
      {iconLeft && <FontAwesomeIcon icon={iconLeft} className={`mr-2 ${children ? '' : '!mr-0'}`} {...iconProps} />}
      {children}
      {iconRight && <FontAwesomeIcon icon={iconRight} className={`ml-2 ${children ? '' : '!ml-0'}`} {...iconProps} />}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'light', 'dark', 'link', 'icon', 'custom', 'dangerOutline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'custom']), // Added 'sm'
  className: PropTypes.string,
  disabled: PropTypes.bool,
  iconLeft: PropTypes.object,
  iconRight: PropTypes.object,
  iconProps: PropTypes.object,
  type: PropTypes.string,
  title: PropTypes.string,
};

export default Button;