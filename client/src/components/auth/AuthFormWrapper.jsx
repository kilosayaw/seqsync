// src/components/auth/AuthFormWrapper.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const AuthFormWrapper = ({ title, children, formType, error, isLoading }) => {
  const isLogin = formType === 'login';

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center bg-gray-900 px-4 py-8 sm:px-6 lg:px-8"> {/* Adjusted min-height */}
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <Link to="/" className="flex justify-center mb-3 cursor-pointer" aria-label="Go to SĒQsync homepage">
             <span className="font-orbitron text-4xl text-brand-accent font-bold hover:opacity-80 transition-opacity">SĒQsync</span>
          </Link>
          <h2 id="auth-form-title" className="mt-6 text-center text-2xl sm:text-3xl font-orbitron tracking-tight text-gray-100">
            {title}
          </h2>
        </div>
        
        {error && (
             <div className="bg-red-800/40 border border-red-700/60 text-red-300 px-4 py-3 rounded-md text-sm shadow-lg" role="alert">
                <p className="font-semibold mb-1">Authentication Error:</p>
                <p>{typeof error === 'string' ? error : error.message || "An unknown error occurred."}</p>
            </div>
        )}

        <div className="relative bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8 space-y-6">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800/70 flex justify-center items-center z-10 rounded-xl backdrop-blur-sm">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-brand-accent"/>
            </div>
          )}
          <div className={`${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
            {children}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link 
            to={isLogin ? "/register" : "/login"} 
            className="font-medium text-brand-accent hover:text-opacity-80 transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

AuthFormWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  formType: PropTypes.oneOf(['login', 'register']).isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]), 
  isLoading: PropTypes.bool,
};

export default AuthFormWrapper;