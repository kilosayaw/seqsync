import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Helper function to check if a prop is a Font Awesome icon object
const isFaIcon = (icon) => {
  return icon && typeof icon === 'object' && icon.prefix && icon.iconName;
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  iconLeft = null,
  iconRight = null,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-150 ease-in-out';

  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-primary-dark text-white focus:ring-brand-accent',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    dangerOutline: 'bg-transparent border border-red-500 text-red-400 hover:bg-red-500/20 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    icon: 'bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-gray-500',
    link: 'bg-transparent text-blue-400 hover:text-blue-300 underline shadow-none focus:ring-blue-400 p-0',
    custom: '',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    custom: '',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // NEW: Robust icon rendering logic
  const renderIcon = (iconProp) => {
    if (!iconProp) return null;
    if (isFaIcon(iconProp)) {
      // If it's a raw FA object, wrap it in the component
      return <FontAwesomeIcon icon={iconProp} />;
    }
    // Otherwise, assume it's already a valid ReactNode (like another component or JSX)
    return iconProp;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {iconLeft && <span className="mr-2 -ml-1">{renderIcon(iconLeft)}</span>}
      {children}
      {iconRight && <span className="ml-2 -mr-1">{renderIcon(iconRight)}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'dangerOutline', 'success', 'icon', 'link', 'custom']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'custom']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  // UPDATED: Allow both node and object for better developer experience
  iconLeft: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  iconRight: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
};

export default Button;