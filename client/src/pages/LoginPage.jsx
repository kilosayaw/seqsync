// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Link is used by AuthFormWrapper
import { useAuth } from '../hooks/useAuth';
import AuthFormWrapper from '../components/auth/AuthFormWrapper';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard"; // Default redirect after login

  // Clear authError from context when component mounts or when inputs change,
  // so user doesn't see stale errors from previous attempts or other pages.
  useEffect(() => {
    if (auth.authError) {
      auth.clearAuthError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]); // auth.clearAuthError is stable, auth.authError change itself isn't a dep here.

  const handleSubmit = async (e) => {
    e.preventDefault();
    // auth.authError will be cleared at the start of auth.login in AuthContext
    try {
      await auth.login(email, password);
      navigate(from, { replace: true }); 
    } catch (err) {
      // Error is set in AuthContext by the login function.
      // AuthFormWrapper will display auth.authError.
      console.error("Login Page: Submit Error caught by component:", err.message); 
    }
  };

  return (
    <AuthFormWrapper 
      title="Sign in to SĒQsync" 
      formType="login" 
      error={auth.authError} 
      isLoading={auth.isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          iconLeft={<FontAwesomeIcon icon={faEnvelope} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          iconLeft={<FontAwesomeIcon icon={faLock} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <div>
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full flex justify-center items-center" // For spinner alignment
            disabled={auth.isLoading}
            // Conditionally render icon or text for loading state
            iconLeft={auth.isLoading ? faSpinner : undefined}
            iconProps={auth.isLoading ? { spin: true, className:"mr-2" } : {}}
          >
            {auth.isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </AuthFormWrapper>
  );
};

export default LoginPage;