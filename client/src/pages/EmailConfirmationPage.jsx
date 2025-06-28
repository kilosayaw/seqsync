// SEGSYNC/client/src/pages/EmailConfirmationPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Ensure this path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/common/Button'; // Ensure this path is correct
import { useAuth } from '../contexts/AuthContext';

const EmailConfirmationPage = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'info'
  const [message, setMessage] = useState('Verifying your email, please hang tight...');
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth(); // Access to auth context functions

  const handleRedirect = useCallback((path, state = {}) => {
    // Use a timeout to allow the user to read the message before redirecting
    setTimeout(() => {
      navigate(path, { replace: true, state });
    }, 3000); // 3-second delay
  }, [navigate]);

  useEffect(() => {
    // Supabase typically puts tokens in the hash part of the URL for email links
    const hash = location.hash.substring(1); // Remove '#'
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const type = params.get('token_type');
    const refreshToken = params.get('refresh_token');
    const errorDescription = params.get('error_description');

    if (errorDescription) {
        setStatus('error');
        setMessage(decodeURIComponent(errorDescription));
        return;
    }

    const processConfirmation = async () => {
      if (type === 'confirmation' && accessToken && refreshToken) {
        // When user clicks confirmation link, Supabase SDK uses these tokens from URL
        // to set the session and effectively confirm the email & log the user in.
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("Email confirmation setSession error:", sessionError);
          setStatus('error');
          setMessage(sessionError.message || 'Failed to verify email. The link may be invalid, expired, or already used.');
        } else if (sessionData && sessionData.session && sessionData.user) {
          console.log("Email confirmed, session set:", sessionData);
          // Update AuthContext state
          // The AuthContext's useEffect listening to token changes in localStorage should ideally handle this,
          // but we can also trigger a refresh or directly set user here if needed.
          // For now, we assume the session is set and the AuthProvider will pick it up.
          // Or, more explicitly:
          if (typeof auth.fetchUserProfile === 'function') { // Check if function exists
             await auth.fetchUserProfile(); // Refresh user profile in AuthContext
          }

          setStatus('success');
          setMessage('Your email has been successfully verified! You are now logged in. Redirecting to dashboard...');
          handleRedirect('/dashboard');
        } else {
          // Fallback if session not set but user might be confirmed
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email_confirmed_at) {
              setStatus('success');
              setMessage('Your email is verified! Redirecting to login...');
              handleRedirect('/login');
          } else {
              setStatus('error');
              setMessage('Verification incomplete. Link may be invalid or used. Try logging in or resend confirmation.');
          }
        }
      } else if (type === 'recovery' && accessToken && refreshToken) {
        // This handles password recovery links.
        // It sets the session so the user can proceed to update their password.
        const { error: recoverySessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        if (recoverySessionError) {
            setStatus('error');
            setMessage('Invalid password recovery link or it has expired.');
        } else {
            setStatus('info');
            setMessage('Password recovery initiated. Redirecting you to update your password...');
            // Navigate to your password update page, which will use this active session
            handleRedirect(`/update-password`); // You'll need to create this page/route
        }
      }
      else {
        setStatus('error');
        setMessage('Invalid or missing confirmation token in URL. Please check the link or request a new one.');
      }
    };

    processConfirmation();

    // Clean the hash from the URL after processing to prevent re-triggering or showing tokens
    // Do this after Supabase JS SDK has had a chance to read it (usually immediate)
    if (window.location.hash && !errorDescription) { // Don't clear if there was an error in the hash params
        setTimeout(() => { // Short delay to ensure SDK processes it
            navigate(location.pathname, { replace: true });
        }, 100);
    }

  }, [location, navigate, auth, handleRedirect]); // Add handleRedirect to dependencies

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4 py-8 text-gray-200">
      <div className="bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl max-w-md w-full">
        <FontAwesomeIcon
          icon={
            status === 'verifying' || status === 'info' ? faSpinner :
            status === 'success' ? faCheckCircle :
            faTimesCircle
          }
          spin={status === 'verifying' || status === 'info'}
          className={`text-5xl mb-6 
            ${status === 'success' ? 'text-green-400' : 
              status === 'error' ? 'text-red-400' : 
              'text-brand-accent'}`}
        />
        <h1 className="text-2xl font-orbitron mb-3">
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'info' && 'Processing...'}
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed whitespace-pre-wrap">{message}</p>
        
        {(status === 'success' || status === 'error') && (
          <Link to={status === 'success' && message.includes("logged in") ? "/dashboard" : "/login"}>
            <Button variant="primary" size="lg">
              {status === 'success' && message.includes("logged in") ? "Go to Dashboard" : "Proceed to Login"}
            </Button>
          </Link>
        )}
        {status === 'info' && message.includes("update your password") && (
             <Link to="/update-password">
                <Button variant="primary" size="lg">Set New Password</Button>
            </Link>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmationPage; // <-- CRUCIAL DEFAULT EXPORT