import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  iconLeft,
  iconRight,
  title
}) => {
  const baseClasses = 'flex items-center justify-center font-semibold rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800';
  const sizeClasses = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', };
  const variantClasses = { primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500', secondary: 'bg-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-gray-500', danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', icon: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700', custom: '', };
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`;

  return (
    <button type="button" onClick={onClick} className={combinedClasses.trim()} disabled={disabled} title={title}>
      {iconLeft && <FontAwesomeIcon icon={iconLeft} className={children ? 'mr-2' : ''} />}
      {children}
      {iconRight && <FontAwesomeIcon icon={iconRight} className={children ? 'ml-2' : ''} />}
    </button>
  );
};
Button.propTypes = { children: PropTypes.node, onClick: PropTypes.func, variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'icon', 'custom']), size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']), className: PropTypes.string, disabled: PropTypes.bool, iconLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), iconRight: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), title: PropTypes.string };
export default Button;