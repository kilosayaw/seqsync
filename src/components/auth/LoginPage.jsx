// src/components/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthFormWrapper from './AuthFormWrapper';
import Input from '../common/Input';
import Button from '../common/Button';
import { faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons'; //Spinner already imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard"; 

  useEffect(() => {
    if (auth.authError && (email || password)) { 
      auth.clearAuthError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]); 

  useEffect(() => { // Clear error on initial mount if present
    if (auth.authError) {
      auth.clearAuthError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      navigate(from, { replace: true }); 
    } catch (err) {
      console.error("Login Page: Submit Error caught by component:", err.message || err); 
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
          id="email" label="Email address" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" autoComplete="email" required
          iconLeft={<FontAwesomeIcon icon={faEnvelope} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <Input
          id="password" label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" autoComplete="current-password" required
          iconLeft={<FontAwesomeIcon icon={faLock} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <div>
          <Button 
            type="submit" variant="primary" className="w-full flex justify-center items-center"
            disabled={auth.isLoading}
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