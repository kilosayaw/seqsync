// src/pages/RegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Link is used by AuthFormWrapper
import { useAuth } from '../hooks/useAuth';
import AuthFormWrapper from '../components/auth/AuthFormWrapper';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { faUser, faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(''); 

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard"; // Default redirect after registration

  useEffect(() => {
    // Clear errors when inputs change or when component mounts/authError changes
    if (auth.authError) auth.clearAuthError();
    if (localError) setLocalError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, email, password, confirmPassword]); // Only clear on input change

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); 
    if (auth.authError) auth.clearAuthError(); 

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { 
        setLocalError('Password must be at least 6 characters long.');
        return;
    }
    // Basic email validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setLocalError('Please enter a valid email address.');
        return;
    }

    try {
      await auth.register(email, password, username.trim() || undefined); // Pass undefined if username is empty/whitespace
      navigate(from, { replace: true }); 
    } catch (err) {
      // Error is set in AuthContext by the register function.
      // AuthFormWrapper will display auth.authError.
      console.error("Registration Page: Submit Error caught by component:", err.message);
    }
  };

  const displayError = localError || auth.authError;

  return (
    <AuthFormWrapper 
      title="Create your SĒQsync Account" 
      formType="register" 
      error={displayError} 
      isLoading={auth.isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="username" label="Username" type="text" value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="YourCreativeName (Optional)"
          autoComplete="username"
          iconLeft={<FontAwesomeIcon icon={faUser} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <Input
          id="email-register" label="Email address" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          iconLeft={<FontAwesomeIcon icon={faEnvelope} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <Input
          id="password-register" label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          required
          iconLeft={<FontAwesomeIcon icon={faLock} className="text-gray-400"/>}
          disabled={auth.isLoading}
        />
        <Input
          id="confirm-password" label="Confirm Password" type="password" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-type your password"
          autoComplete="new-password"
          required
          iconLeft={<FontAwesomeIcon icon={faLock} className="text-gray-400"/>}
          disabled={auth.isLoading}
          error={localError && localError.includes('match') ? localError : null} 
        />
        <div>
          <Button 
            type="submit" variant="primary" className="w-full flex justify-center items-center"
            disabled={auth.isLoading}
            iconLeft={auth.isLoading ? faSpinner : undefined} // Show spinner only when loading
            iconProps={auth.isLoading ? { spin: true, className:"mr-2" } : {}}
          >
            {auth.isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </AuthFormWrapper>
  );
};

export default RegistrationPage;