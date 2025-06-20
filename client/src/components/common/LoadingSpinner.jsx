// src/components/common/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingSpinner = ({ size = '3x', text = 'Loading...', className = '', textColor = 'text-gray-300', iconColor = 'text-brand-accent' }) => {
  return (
    <div className={`flex flex-col justify-center items-center text-center ${className}`}>
      <FontAwesomeIcon icon={faSpinner} spin size={size} className={`${iconColor} mb-3`} />
      {text && <p className={`text-lg ${textColor}`}>{text}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  text: PropTypes.string,
  className: PropTypes.string,
  textColor: PropTypes.string,
  iconColor: PropTypes.string,
};

export default LoadingSpinner;