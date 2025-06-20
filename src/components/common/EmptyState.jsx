// src/components/common/EmptyState.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from './Button';

const EmptyState = ({ icon, title, message, actionText, onActionClick, className = '' }) => {
  return (
    <div className={`text-center py-12 px-6 bg-gray-800 rounded-xl shadow-xl ${className}`}>
      {icon && <FontAwesomeIcon icon={icon} size="3x" className="text-gray-500 mb-4" />}
      {title && <h2 className="text-xl font-semibold text-gray-300 mb-3">{title}</h2>}
      {message && <p className="text-gray-400 mb-6 max-w-md mx-auto">{message}</p>}
      {actionText && onActionClick && (
        <Button onClick={onActionClick} variant="primary" size="lg">
          {actionText}
        </Button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.object,
  title: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  onActionClick: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;