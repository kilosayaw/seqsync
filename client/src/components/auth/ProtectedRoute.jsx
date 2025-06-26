// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ProtectedRoute = ({ children }) => { 
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-gray-300"> {/* Adjusted min-height for better centering */}
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-brand-accent mb-4"/>
        <p className="text-xl font-orbitron">Verifying Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />; 
};

ProtectedRoute.propTypes = {
  children: PropTypes.node, // children is optional
};

export default ProtectedRoute;